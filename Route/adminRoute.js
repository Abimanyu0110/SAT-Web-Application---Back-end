import express from "express";
import adminServices from "../Services/adminServices.js";

const adminRoute = express.Router()

adminRoute.post("/login", adminServices.login); // Admin and Teacher Login Route
adminRoute.post("/adminSignup", adminServices.adminSignup); // Admin Signup Route
adminRoute.post("/teacherSignup", adminServices.teacherSignup); // Teacher Signup Route
adminRoute.get("/getTeachersList", adminServices.getTeachersList); // Get Teachers List
adminRoute.get("/getAdminDataById", adminServices.getAdminDataById); // Get single data from admins Table
adminRoute.get("/getTeacherDashboard", adminServices.getTeacherDashboard); //Get Teacher Dashboard Datas
adminRoute.get("/getAdminDashboard", adminServices.getAdminDashboard); // Get Admin Dashboard Datas
adminRoute.get("/getAttendanceReport", adminServices.getAttendanceReport); // Get Attenance Report

adminRoute.delete("/deleteDataById", adminServices.deleteDataById); //Delete Data By Id

export default adminRoute;