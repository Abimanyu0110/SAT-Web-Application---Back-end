import express from "express";
import attendanceServices from "../Services/attendanceServices.js";

const attendanceRoute = express.Router()

attendanceRoute.post("/manageAttendance", attendanceServices.manageAttendance); // Add and update Attendance
attendanceRoute.get("/getAttendanceListByDate", attendanceServices.getAttendanceListByDate); // Get Attendance List By Date
attendanceRoute.get("/getAttendanceDataByDate", attendanceServices.getAttendanceDataByDate); // Get Attendance Data By Date

export default attendanceRoute;