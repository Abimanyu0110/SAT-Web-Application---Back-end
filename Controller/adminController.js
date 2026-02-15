import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

// -------- Database Connection file ------------
import db from "../Config/db.js";

// -------- Utils ---------------------
import { generateAccessToken } from "../utils/tokenUtil.js";

const adminController = {};

// ------------ Admin / Teacher Add and Edit ---------------------
adminController.manageSignup = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Successfully Signed Up!",
        responseData = [];
    try {
        // input params
        const { firstName, lastName, dob, role, gender, email, password, organizationName, secretCode, id,
            teacherClass, section, subject, adminId, organizationCode, shortName
        } = req.body;

        let hashedPassword;

        // password check and encrypt
        if (password && password.length > 0) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        let result = [] // for query
        // If id is present, it means the record is already created, so this is for update
        if (id && id.length > 0) {
            [result] = await db.query(
                `UPDATE admins
                    SET firstName = ?,
                        lastName = ?,
                        dob = ?,
                        gender = ?,
                        email = ?,
                        class = ?, 
                        section = ?, 
                        subject = ?
                    WHERE id = ?`,
                [firstName, lastName, dob, gender, email, teacherClass, section, subject, id]
            );
            responseMessage = "Edited Successfully";
        }
        // If no id, it means this is new data, so insert it
        else {
            [result] = await db.query(
                `INSERT INTO admins (firstName, lastName, dob, role, gender, email, password, organizationName, 
                secretCode, class, section, subject, adminId, organizationCode, shortName ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, dob, role, gender, email, hashedPassword, organizationName, secretCode,
                    teacherClass, section, subject, adminId, organizationCode, shortName
                ]
            );
        }

    } catch (err) {
        // Duplicate Entry Check, Because Email column is Unique
        if (err.code === 'ER_DUP_ENTRY') {
            responseCode = 409;
            responseMessage = "Data already exists";
        } else {
            responseCode = 400;
            responseMessage = err;
        }
    }
    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});

// ------------ Login - Teacher and Admin -----------------------
adminController.login = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Logged In Successfully!",
        responseData = {};

    try {
        // input params
        const { email, password, secretCode } = req.body;

        // Fetch Admin Datas
        const [result] = await db.query(
            `SELECT 
                A.id AS userId,
                A.firstName,
                A.lastName,
                A.email,
                A.password,
                A.role,
                A.adminId,
                B.id AS mappedAdminId,
                B.secretCode AS adminSecretCode
            FROM admins A
            LEFT JOIN admins B ON B.id = A.adminId
            WHERE A.email = ?`,
            [email]
        );

        // Email not found
        if (result.length === 0) {
            return res.json({
                code: 400,
                message: "Incorrect Email!",
                data: {}
            });
        }

        const user = result[0];

        // ===== ADMIN LOGIN =====
        if (user.role === "ADMIN") {
            //Password Check
            if (!password) {
                return res.json({
                    code: 400,
                    message: "Password is required!",
                    data: {}
                });
            }

            // Password Comparision
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.json({
                    code: 400,
                    message: "Incorrect Password!",
                    data: {}
                });
            }
        }

        // ===== TEACHER LOGIN =====
        else if (user.role === "TEACHER") {
            // adminId and secretCode Check
            if (!user.adminId || !user.adminSecretCode) {
                return res.json({
                    code: 400,
                    message: "Teacher is not linked to any admin",
                    data: {}
                });
            }

            // secretCode check
            if (!secretCode) {
                return res.json({
                    code: 400,
                    message: "Secret Code is required!",
                    data: {}
                });
            }

            // secretCode Comparision
            if (user.adminSecretCode !== secretCode) {
                return res.json({
                    code: 400,
                    message: "Incorrect Secret Code!",
                    data: {}
                });
            }
        }

        // ===== GENERATE TOKEN =====
        const accessToken = generateAccessToken({
            id: user.userId,
            role: user.role
        });

        // Update new accessToken
        await db.query(
            `UPDATE admins
            SET accessToken = ?, tokenExpiresAt = DATE_ADD(NOW(), INTERVAL 7 DAY)
            WHERE id = ?`,
            [accessToken, user.userId]
        );

        // Response
        responseData = {
            userId: user.userId,
            userName: `${user.firstName} ${user.lastName}`,
            role: user.role,
            accessToken
        };

    } catch (err) {
        console.error(err);
        responseCode = 409;
        responseMessage = "Something Went Wrong";
    }

    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData
    });
});

// --------- Get Teachers List -------------------------
adminController.getTeachersList = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        // input params
        const id = Number(req.query.id);
        const search = req.query.search;
        const limit = Number(req.query.limit) || 10;  // default 10
        const skip = Number(req.query.skip) || 0;     // default 0

        // Base List Query
        let query = `
            SELECT
                id,
                firstName,
                lastName,
                email,
                class,
                section,
                gender,
                subject
            FROM admins
            WHERE role = 'TEACHER'
            AND adminId = ?
        `;

        // Base Count Query
        let countQuery = `
            SELECT COUNT(*) AS total
            FROM admins
            WHERE role = 'TEACHER'
            AND adminId = ?
        `;

        let params = [id];

        // Add search filter
        if (search && search.trim() !== "") {
            query += `
                AND (
                    LOWER(firstName) LIKE LOWER(?)
                    OR LOWER(email) LIKE LOWER(?)
                    OR class LIKE ?
                    OR LOWER(section) LIKE LOWER(?)
                    OR LOWER(gender) LIKE LOWER(?)
                    OR LOWER(subject) LIKE LOWER(?)
                )
            `;

            countQuery += `
                AND (
                    LOWER(firstName) LIKE LOWER(?)
                    OR LOWER(email) LIKE LOWER(?)
                    OR class LIKE ?
                    OR LOWER(section) LIKE LOWER(?)
                    OR LOWER(gender) LIKE LOWER(?)
                    OR LOWER(subject) LIKE LOWER(?)
                )
            `;

            const searchValue = `%${search}%`;
            const genderSearchValue = `${search}%`;
            params.push(searchValue, searchValue, searchValue, searchValue, genderSearchValue, searchValue);
        }

        // Add pagination to list query
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, skip);

        // Execute Queries
        const [result] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, params.slice(0, params.length - 2)); // count does not need limit/offset

        // Response
        if (result.length === 0) {
            responseCode = 400;
            responseMessage = "No Teachers Found!";
            responseData.data = [];
            responseData.count = 0;
        } else {
            responseData.data = result;
            responseData.count = countResult[0].total;
        }

    } catch (err) {
        console.error(err);
        responseCode = 400;
        responseMessage = "Something Went Wrong";
        responseData = {};
    }
    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});


// --------- Get Single Admin Data By Id -------------------------
adminController.getAdminDataById = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        // input params
        const { id } = req.query;

        // Query
        const [result] = await db.query(`
           SELECT *
            FROM admins
            WHERE id = ?`,
            [id]
        );

        // Response
        if (result.length === 0) {
            responseCode = 400;
            responseMessage = "No Record Found!";
            responseData = {};
        } else {
            responseData = result[0];
        }

    } catch (err) {
        console.error(err);
        responseCode = 400;
        responseMessage = "Something Went Wrong";
        responseData = {};
    }
    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});

// --------- Get Teacher Dashboard Datas -------------------------
adminController.getTeacherDashboard = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        // Input params
        const { id } = req.query;

        // Datas Query
        const [teacherDatas] = await db.query(`    
            SELECT
                A.class,
                A.section,
                COUNT(DISTINCT S.id) AS myStudents,
                SUM(CASE WHEN AD.status = 1 THEN 1 ELSE 0 END) AS todayPresent,
                SUM(CASE WHEN AD.status = 0 THEN 1 ELSE 0 END) AS todayAbsent,
                AA.organizationName,
                AA.organizationCode
            FROM admins A
            LEFT JOIN students S 
                ON A.class = S.class
                AND A.section = S.section
            LEFT JOIN attendance AD 
                ON AD.studentId = S.id
                AND AD.markedBy = A.id
                AND AD.date = CURDATE()
            INNER JOIN admins AA 
                ON AA.id = A.adminId
            WHERE A.id = ?
            GROUP BY A.class, A.section, AA.organizationName, AA.organizationCode;`,
            [id]
        );

        // List Query
        const [attendanceList] = await db.query(`
           SELECT 
                date,
                COUNT(*) AS totalStudents,
                SUM(status = 1) AS totalPresent,
                SUM(status = 0) AS totalAbsent
            FROM attendance
            WHERE markedBy = ?
            GROUP BY date
            ORDER BY date DESC`,
            [id]
        );

        // Response
        if (!teacherDatas) {
            responseCode = 400;
            responseMessage = "No Record Found!";
            responseData = {};
        } else {
            responseData.teacherDatas = teacherDatas[0];
            responseData.attendanceList = attendanceList;
        }

    } catch (err) {
        console.error(err);
        responseCode = 400;
        responseMessage = "Something Went Wrong";
        responseData = {};
    }
    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});

// --------- Get Admin Dashboard Datas -------------------------
adminController.getAdminDashboard = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        // input params
        const { id } = req.query;

        // Datas Query
        const [adminDatas] = await db.query(`
           SELECT
                A.organizationName,
                A.organizationCode,
                A.shortName,
                A.secretCode,
                COUNT(DISTINCT T.id) AS totalTeachers,
                COUNT(DISTINCT S.id) AS totalStudents,
                SUM(CASE WHEN AD.status = 1 THEN 1 ELSE 0 END) AS todayPresent,
                SUM(CASE WHEN AD.status = 0 THEN 1 ELSE 0 END) AS todayAbsent
            FROM admins A
            LEFT JOIN admins T
                ON T.adminId = A.id
            LEFT JOIN students S
                ON T.class = S.class
                AND T.section = S.section
            LEFT JOIN attendance AD 
                ON AD.studentId = S.id
                AND AD.markedBy = T.id
                AND AD.date = CURDATE()
            WHERE A.id = ?;`,
            [id]
        );

        // List Query
        const [attendanceList] = await db.query(`
           SELECT 
                AD.date,
                AD.markedBy,
                CONCAT(T.firstName,' ',T.lastName) AS teacher,
                T.class,
                T.section,
                COUNT(*) AS totalStudents,
                SUM(AD.status = 1) AS totalPresent,
                SUM(AD.status = 0) AS totalAbsent
            FROM attendance AD
            LEFT JOIN admins T ON T.id = AD.markedBy
            GROUP BY AD.date, AD.markedBy
            ORDER BY AD.date DESC`
        );

        // Response
        if (!adminDatas) {
            responseCode = 400;
            responseMessage = "No Record Found!";
            responseData = {};
        } else {
            responseData.adminDatas = adminDatas[0];
            responseData.attendanceList = attendanceList;
        }

    } catch (err) {
        console.error(err);
        responseCode = 400;
        responseMessage = "Something Went Wrong";
        responseData = {};
    }
    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});

// --------- Get Attendance Report List (Student-wise) -------------------------
adminController.getAttendanceReport = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = [];

    try {
        // input params
        const {
            role,
            userId,
            month, // optional filter
            year, // optional filter
            studentClass, // optional filter
            section // optional filter
        } = req.query;

        // Variables of WHERE CONDITION and their PARAMS
        let whereConditions = [];
        let queryParams = [];

        // If Role is TEACHER
        if (role === "TEACHER") {
            // Teacher can see ONLY their students
            whereConditions.push("AD.markedBy = ?");
            queryParams.push(userId);
        }

        // If Role is ADMIN
        if (role === "ADMIN") {
            // class filter
            if (studentClass > 0) {
                whereConditions.push("S.class = ?");
                queryParams.push(studentClass);
            }
            // Section Filter
            if (section && section.length > 0) {
                whereConditions.push("S.section = ?");
                queryParams.push(section);
            }
        }

        // month filter
        if (month) {
            whereConditions.push("MONTH(AD.date) = ?");
            queryParams.push(month);
        }

        // year filter
        if (year) {
            whereConditions.push("YEAR(AD.date) = ?");
            queryParams.push(year);
        }

        // WHERE Conditions joining
        const whereClause =
            whereConditions.length > 0
                ? `WHERE ${whereConditions.join(" AND ")}`
                : "";

        // List Query
        const [attendanceList] = await db.query(`
            SELECT
                S.id AS studentId,
                CONCAT(S.firstName, ' ', S.lastName) AS studentName,
                S.class,
                S.section,
                COUNT(AD.id) AS totalDays,
                SUM(CASE WHEN AD.status = 1 THEN 1 ELSE 0 END) AS presentDays,
                SUM(CASE WHEN AD.status = 0 THEN 1 ELSE 0 END) AS absentDays,
                ROUND(
                    (SUM(CASE WHEN AD.status = 1 THEN 1 ELSE 0 END) / COUNT(AD.id)) * 100,
                    2
                ) AS attendancePercentage
            FROM attendance AD
            INNER JOIN students S ON S.id = AD.studentId
            ${whereClause}
            GROUP BY S.id, S.firstName, S.lastName, S.class, S.section
            ORDER BY studentName ASC;
        `, queryParams);

        // Response
        responseData = attendanceList;

    } catch (err) {
        console.error(err);
        responseCode = 400;
        responseMessage = "Something Went Wrong";
        responseData = [];
    }

    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});

// --------- Delete a Record By Id in both admins and students Table -------------------------
adminController.deleteDataById = asyncHandler(async (req, res) => {
    try {
        // input params
        const { id, targetTable } = req.body;

        // check for id and targetTable
        if (!id || !targetTable) {
            throw new Error("id and targetTable are required");
        }

        // If targetTable is Students
        if (targetTable === "students") {
            // Delete attendance first, Because it has FK of studentsId
            await db.query(
                `DELETE FROM attendance WHERE studentId = ?`,
                [id]
            );

            // Then delete student
            await db.query(
                `DELETE FROM students WHERE id = ?`,
                [id]
            );

        }
        // If targetTable is admins
        else {
            await db.query(
                `DELETE FROM \`${targetTable}\` WHERE id = ?`,
                [id]
            );
        }

        // Response
        return res.json({
            code: 200,
            message: "Deleted Successfully",
            data: {}
        });

    } catch (err) {
        console.error(err);
        return res.json({
            code: 400,
            message: err.message,
            data: {}
        });
    }
});


//----------
export default adminController;
