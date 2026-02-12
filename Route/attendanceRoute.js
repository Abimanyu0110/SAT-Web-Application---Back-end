import express from "express";
import attendanceServices from "../Services/attendanceServices.js";

const attendanceRoute = express.Router()

attendanceRoute.post("/manageAttendance", attendanceServices.manageAttendance); // Add and update Attendance Route
attendanceRoute.post("/getAttendanceListByDate", attendanceServices.getAttendanceListByDate); // Get Attendance List By Date Route
attendanceRoute.post("/getAttendanceDataByDate", attendanceServices.getAttendanceDataByDate); // Get Attendance Data By Date Route


// attendanceRoute.post("/adminSignup", adminServices.adminSignup); // Admin Signup Route
// adminRoute.post("/teacherSignup", adminServices.teacherSignup); //Teacher Signup Route
// adminRoute.post("/getTeachersList", adminServices.getTeachersList); //Teacher Signup Route

export default attendanceRoute;