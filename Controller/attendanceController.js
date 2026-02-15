import asyncHandler from "express-async-handler";

// -------- Database Connection file ------------
import db from "../Config/db.js";

const attendanceController = {};

// ------------ Add / Edit Attendance ---------------------
attendanceController.manageAttendance = asyncHandler(async (req, res) => {
    let responseCode = 200;
    let responseMessage = "Attendance saved successfully";
    let responseData = [];

    try {
        // input params
        const { date, markedBy, attendance } = req.body;

        // Checks date, markedBy and attendance
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

        // Insert Query
        const sql = `
            INSERT INTO attendance (date, studentId, markedBy, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                markedBy = VALUES(markedBy)
        `;

        // Query Execute
        await db.query(sql, [values]);

    } catch (err) {
        responseCode = 500;
        responseMessage = "Failed to save attendance";
    }

    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData
    });
});

// --------- Get Attendance List By Date -------------------------
attendanceController.getAttendanceListByDate = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};

    try {
        // input params
        const id = Number(req.query.id);
        const limit = Number(req.query.limit) || 10;
        const skip = Number(req.query.skip) || 0;
        const search = req.query.search;

        // Convert front-end date to DB format for Search
        // Front-end: DD-MM-YYYY
        // DB: YYYY-MM-DD
        let dbDate;
        if (search && search.trim() !== '') {
            const [day, month, year] = search.split('-');
            dbDate = `${year}-${month}-${day}`;
        }

        let dateSearchSql = dbDate ? ` AND date = ? ` : '';
        const params = dbDate ? [id, dbDate, limit, skip] : [id, limit, skip];

        // List Query
        const [result] = await db.query(`
           SELECT 
                date,
                COUNT(*) AS totalStudents,
                SUM(status = 1) AS totalPresent,
                SUM(status = 0) AS totalAbsent
            FROM attendance
            WHERE markedBy = ?
            ${dateSearchSql}
            GROUP BY date
            ORDER BY date DESC
            LIMIT ? OFFSET ?`,
            params
        );

        // Count Query
        const countParams = dbDate ? [id, dbDate] : [id];
        const [countResult] = await db.query(`
            SELECT COUNT(DISTINCT date) AS total 
            FROM attendance
            WHERE markedBy = ?
            ${dateSearchSql}`,
            countParams
        );

        // Response
        if (result.length === 0) {
            responseCode = 400;
            responseMessage = "No Records Found!";
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

// --------- Get Single Attendance Data By Date - API -------------------------
attendanceController.getAttendanceDataByDate = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = {};
    try {
        // input params
        const { date, id } = req.query;

        // QUERY
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
        );

        // RESPONSE
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
