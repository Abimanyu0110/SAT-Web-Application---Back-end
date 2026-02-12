import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

// -------- Database Connection file ------------
import db from "../Config/db.js";

// -------- Utils ---------------------
import { generateAccessToken } from "../utils/tokenUtil.js";

const attendanceController = {};

// ------------ Add / Edit Attendance - API ---------------------
attendanceController.manageAttendance = asyncHandler(async (req, res) => {
    let responseCode = 200;
    let responseMessage = "Attendance saved successfully";
    let responseData = [];

    try {
        const { date, markedBy, attendance } = req.body;

        if (!date || !markedBy || !Array.isArray(attendance)) {
            return res.json({
                code: 400,
                message: "Invalid input data",
                data: []
            });
        }

        // Prepare bulk insert values
        const values = attendance.map(item => [
            date,
            item.studentId,
            markedBy,
            item.isPresent ? 1 : 0
        ]);

        const sql = `
            INSERT INTO attendance (date, studentId, markedBy, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                markedBy = VALUES(markedBy)
        `;

        await db.query(sql, [values]);

    } catch (err) {
        console.error(err);

        responseCode = 500;
        responseMessage = "Failed to save attendance";
    }

    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData
    });
});

// --------- Get Attendance List By Date - API -------------------------
attendanceController.getAttendanceListByDate = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        const { id, skip, limit } = req.body;

        const [result] = await db.query(`
           SELECT 
                date,
                COUNT(*) AS totalStudents,
                SUM(status = 1) AS totalPresent,
                SUM(status = 0) AS totalAbsent
            FROM attendance
            WHERE markedBy = ?
            GROUP BY date
            ORDER BY date DESC
            LIMIT ? OFFSET ?`,
            [id, limit, skip]
        ); // All Attendance Record By Date

        const [countResult] = await db.query(`
            SELECT COUNT(DISTINCT date) AS total 
            FROM attendance
            WHERE markedBy = ?`,
            [id]
        ); // Total Attendance for that date

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

// --------- Get Attendance Data By Date - API -------------------------
attendanceController.getAttendanceDataByDate = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        const { date, id } = req.body;

        const [result] = await db.query(`
           SELECT 
                A.studentId,
                A.status,
                A.date,
                CONCAT(S.firstName,' ',S.lastName) AS name,
                S.registerNumber
            FROM attendance A
            LEFT JOIN students S ON A.studentId = S.id
            WHERE A.markedBy = ?
            AND A.DATE = ? `,
            [id, date]
        ); // All Attendance Datas By Date

        if (result.length === 0) {
            responseCode = 400;
            responseMessage = "No Products Found!";
            responseData = {};
        } else {
            responseData = result;
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
export default attendanceController;
