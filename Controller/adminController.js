import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

// -------- Database Connection file ------------
import db from "../Config/db.js";

// -------- Utils ---------------------
import { generateAccessToken } from "../utils/tokenUtil.js";

const adminController = {};

// ------------ Admin / Teacher SignUp - API ---------------------
adminController.manageSignup = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Successfully Signed Up!",
        responseData = [];
    try {
        const { firstName, lastName, dob, role, gender, email, password, organizationName, secretCode, id,
            teacherClass, section, subject, adminId, organizationCode, shortName
        } = req.body; // input params

        let hashedPassword;

        if (password && password.length > 0) {
            hashedPassword = await bcrypt.hash(password, 10); // password encrypt for security reasons
        }

        let result = [] // for query
        // If id came means it is already created record, so it is for UPDATE
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
        // If no id means it is new data, so it is for INSERT
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
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') { // Duplicate Entry Check, Because Email column is Unique
            responseCode = 409;
            responseMessage = "Email already exists";
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

// ------------ Login - Teacher and Admin - API -----------------------
adminController.login = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Logged In Successfully!",
        responseData = {};

    try {
        const { email, password, secretCode } = req.body;

        // Fetch user (ADMIN or TEACHER) + mapped ADMIN (if teacher)
        const [result] = await db.query(
            `SELECT 
                A.id              AS userId,
                A.firstName,
                A.lastName,
                A.email,
                A.password,
                A.role,
                A.adminId,
                B.id              AS mappedAdminId,
                B.secretCode      AS adminSecretCode
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
            if (!password) {
                return res.json({
                    code: 400,
                    message: "Password is required!",
                    data: {}
                });
            }

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
            if (!user.adminId || !user.adminSecretCode) {
                return res.json({
                    code: 400,
                    message: "Teacher is not linked to any admin",
                    data: {}
                });
            }

            if (!secretCode) {
                return res.json({
                    code: 400,
                    message: "Secret Code is required!",
                    data: {}
                });
            }

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

        await db.query(
            `UPDATE admins
       SET accessToken = ?, tokenExpiresAt = DATE_ADD(NOW(), INTERVAL 7 DAY)
       WHERE id = ?`,
            [accessToken, user.userId]
        );

        responseData = {
            userId: user.userId,
            userName: `${user.firstName} ${user.lastName}`,
            role: user.role,
            accessToken
        };

    } catch (err) {
        console.error(err);
        responseCode = 409;
        // responseMessage = "Something Went Wrong";
        responseMessage = err;
    }

    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData
    });
});

// --------- Get Teachers List - API -------------------------
adminController.getTeachersList = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        const { id } = req.body;

        const [result] = await db.query(`
            SELECT * 
            FROM admins
            WHERE role = 'TEACHER'
            AND adminId = ?`,
            [id]
        ); // All Teachers records

        const [countResult] = await db.query(`
            SELECT COUNT(*) AS total 
            FROM admins
            WHERE role = 'TEACHER'
            AND adminId = ?`,
            [id]
        ); // Total Teachers

        if (result.length === 0) {
            responseCode = 400;
            responseMessage = "No Products Found!";
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

// --------- Get Student Data By Id - API -------------------------
adminController.getAdminDataById = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        const { id } = req.body;

        const [result] = await db.query(`
           SELECT *
            FROM admins
            WHERE id = ?`,
            [id]
        );

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

// --------- Get Teacher Dashboard - API -------------------------
adminController.getTeacherDashboard = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        const { id } = req.body;

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

// --------- Get Admin Dashboard - API -------------------------
adminController.getAdminDashboard = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        const { id } = req.body;

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

// --------- Get Attendance Report (Student-wise) -------------------------
adminController.getAttendanceReport = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = [];

    try {
        const {
            role,
            userId,
            month, // optional
            year, // optional
            studentClass, // optional
            section // optional
        } = req.body;

        let whereConditions = [];
        let queryParams = [];

        // ---------------- ROLE BASED FILTER ----------------
        if (role === "TEACHER") {
            // Teacher can see ONLY their students
            whereConditions.push("AD.markedBy = ?");
            queryParams.push(userId);
        }

        if (role === "ADMIN") {
            if (studentClass > 0 && section.length > 0) {
                whereConditions.push("S.class = ? AND S.section = ?");
                queryParams.push(studentClass, section);
            }
        }

        // ---------------- DATE FILTER ----------------
        if (month && year) {
            whereConditions.push("MONTH(AD.date) = ? AND YEAR(AD.date) = ?");
            queryParams.push(month, year);
        }

        const whereClause =
            whereConditions.length > 0
                ? `WHERE ${whereConditions.join(" AND ")}`
                : "";

        // ---------------- MAIN QUERY ----------------
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


//----------
export default adminController;
