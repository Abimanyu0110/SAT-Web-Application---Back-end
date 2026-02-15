import asyncHandler from "express-async-handler";

// Database Connection file 
import db from "../Config/db.js";

const studentController = {};

// ------------ Add / Edit Student ---------------------
studentController.manageStudent = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Successfully Added!",
        responseData = [];
    try {
        // input params
        const {
            id, firstName, lastName, dob, gender, registerNumber, teacherClass,
            section, adminId
        } = req.body;

        // for query
        let result = []

        // If id is present, it means the record is already created, so this is for update
        if (id && id.length > 0) {
            [result] = await db.query(
                `UPDATE students
                    SET firstName = ?,
                        lastName = ?,
                        dob = ?,
                        gender = ?,
                        registerNumber = ?,
                        class = ?, 
                        section = ?
                    WHERE id = ?`,
                [firstName, lastName, dob, gender, registerNumber, teacherClass, section, id]
            );
            responseMessage = "Edited Successfully";
        }
        // If no id, it means this is new data, so insert it
        else {
            [result] = await db.query(
                `INSERT INTO students (firstName, lastName, dob, gender, registerNumber, 
                class, section, adminId ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, dob, gender, registerNumber, teacherClass, section, adminId]
            );
        }

    } catch (err) {
        // Duplicate Entry Check, Because AdminId + Register Number columns is Unique
        if (err.code === 'ER_DUP_ENTRY') {
            responseCode = 409;
            responseMessage = "Register Number already exists";
        } else {
            responseCode = 400;
            responseMessage = "Failed to Add";
        }
    }
    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});

// --------- Get Students List -------------------------
studentController.getStudentsList = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};

    try {
        // input params
        const { id, role, limit, skip, search } = req.query;

        let result;
        let countResult;

        const isPaginated =
            Number.isInteger(limit) &&
            Number.isInteger(skip) &&
            limit > 0 &&
            skip >= 0;

        const hasSearch = search && search.trim() !== "";
        const searchValue = `%${search}%`;
        const genderSearchValue = `${search}%`;

        // For ADMIN
        if (role === "ADMIN") {
            // List Query
            let sql = `
                SELECT *
                FROM students
                WHERE adminId = ?
            `;
            // Count Query
            let countSql = `
                SELECT COUNT(*) AS total
                FROM students
                WHERE adminId = ?
            `;
            // Pass params for list and Count
            const params = [id];
            const countParams = [id];

            // Checks Search
            if (hasSearch) {
                const searchCondition = `
                    AND (
                        LOWER(firstName) LIKE LOWER(?)
                        OR LOWER(registerNumber) LIKE LOWER(?)
                        OR \`class\` LIKE ?
                        OR LOWER(section) LIKE (?)
                        OR LOWER(gender) LIKE (?)
                    )
                `;

                sql += searchCondition;
                countSql += searchCondition;

                // search params to List
                params.push(
                    searchValue,
                    searchValue,
                    searchValue,
                    searchValue,
                    genderSearchValue
                );

                // search params to Count
                countParams.push(
                    searchValue,
                    searchValue,
                    searchValue,
                    searchValue,
                    genderSearchValue
                );
            }

            sql += ` ORDER BY registerNumber`;

            if (isPaginated) {
                sql += ` LIMIT ? OFFSET ?`;
                params.push(limit, skip);
            }

            [result] = await db.query(sql, params);
            [countResult] = await db.query(countSql, countParams);
        }

        // For TEACHER
        else {
            // List Query
            let sql = `
                SELECT S.*
                FROM students S
                INNER JOIN admins A
                    ON A.\`class\` = S.\`class\`
                   AND A.section = S.section
                WHERE A.id = ?
            `;
            // Count Query
            let countSql = `
                SELECT COUNT(*) AS total
                FROM students S
                INNER JOIN admins A
                    ON A.\`class\` = S.\`class\`
                   AND A.section = S.section
                WHERE A.id = ?
            `;

            // passing params to List and Count
            const params = [id];
            const countParams = [id];

            // Checks search
            if (hasSearch) {
                const searchCondition = `
                    AND (
                        LOWER(S.firstName) LIKE LOWER(?)
                        OR LOWER(S.registerNumber) LIKE LOWER(?)
                        OR S.\`class\` LIKE ?
                        OR LOWER(S.section) LIKE LOWER(?)
                        OR LOWER(S.gender) LIKE LOWER(?)
                    )
                `;

                sql += searchCondition;
                countSql += searchCondition;

                params.push(
                    searchValue,
                    searchValue,
                    searchValue,
                    searchValue,
                    genderSearchValue
                );

                countParams.push(
                    searchValue,
                    searchValue,
                    searchValue,
                    searchValue,
                    genderSearchValue
                );
            }

            sql += ` ORDER BY S.registerNumber`;

            if (isPaginated) {
                sql += ` LIMIT ? OFFSET ?`;
                params.push(limit, skip);
            }

            [result] = await db.query(sql, params);
            [countResult] = await db.query(countSql, countParams);
        }

        // RESPONSE
        responseData = {
            data: result,
            count: countResult[0].total
        };

        if (result.length === 0) {
            responseMessage = "No Record Found!";
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
        data: responseData
    });
});

// --------- Get Student Data By Id - API -------------------------
studentController.getStudentDataById = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        // Input params
        const { id } = req.query;

        // Query
        const [result] = await db.query(`
           SELECT 
                S.id,
                S.firstName,
                S.lastName,
                S.dob,
                S.registerNumber,
                S.gender,
                S.class,
                S.section,
                CONCAT(A.firstName,' ',A.lastName) AS teacher
            FROM students S
            LEFT JOIN admins A ON S.class = A.class AND S.section = A.section
            WHERE S.id = ?`,
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

//----------
export default studentController;
