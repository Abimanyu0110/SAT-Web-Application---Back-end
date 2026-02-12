import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

// -------- Database Connection file ------------
import db from "../Config/db.js";

// -------- Utils ---------------------
import { generateAccessToken } from "../utils/tokenUtil.js";

const studentController = {};

// ------------ Add / Edit Student - API ---------------------
studentController.manageStudent = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Successfully Added!",
        responseData = [];
    try {
        const {
            id, firstName, lastName, dob, gender, registerNumber, teacherClass,
            section, adminId
        } = req.body; // input params

        let result = [] // for query
        // If id came means it is already created record, so it is for UPDATE
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
        // If no id means it is new data, so it is for INSERT
        else {
            [result] = await db.query(
                `INSERT INTO students (firstName, lastName, dob, gender, registerNumber, 
                class, section, adminId ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, dob, gender, registerNumber, teacherClass, section, adminId]
            );
        }

    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') { // Duplicate Entry Check, Because Email column is Unique
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

// --------- Get Students List - API -------------------------
studentController.getStudentsList = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};

    try {
        const { id, role, limit, skip } = req.body;

        let result;
        let countResult;

        // check if pagination is required
        const isPaginated =
            Number.isInteger(limit) &&
            Number.isInteger(skip) &&
            limit > 0 &&
            skip >= 0;

        /* =======================
           ADMIN QUERY
        ======================== */
        if (role === "ADMIN") {
            let sql = `
        SELECT *
        FROM students
        WHERE adminId = ?
        ORDER BY registerNumber
      `;

            const params = [id];

            if (isPaginated) {
                sql += ` LIMIT ? OFFSET ?`;
                params.push(limit, skip);
            }

            [result] = await db.query(sql, params);

            [countResult] = await db.query(
                `
        SELECT COUNT(*) AS total
        FROM students
        WHERE adminId = ?
        `,
                [id]
            );
        }

        /* =======================
           TEACHER QUERY
        ======================== */
        else {
            let sql = `
        SELECT S.*
        FROM students S
        INNER JOIN admins A
          ON A.\`class\` = S.\`class\`
         AND A.section = S.section
        WHERE A.id = ?
        ORDER BY S.registerNumber
      `;

            const params = [id];

            if (isPaginated) {
                sql += ` LIMIT ? OFFSET ?`;
                params.push(limit, skip);
            }

            [result] = await db.query(sql, params);

            [countResult] = await db.query(
                `
        SELECT COUNT(*) AS total
        FROM students S
        INNER JOIN admins A
          ON A.\`class\` = S.\`class\`
         AND A.section = S.section
        WHERE A.id = ?
        `,
                [id]
            );
        }

        /* =======================
           RESPONSE
        ======================== */
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
        const { id } = req.body;

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
