import express from "express";
import adminServices from "../Services/adminServices.js";

const adminRoute = express.Router()

adminRoute.post("/login", adminServices.login); // Admin and Teacher Login Route
adminRoute.post("/adminSignup", adminServices.adminSignup); // Admin Signup Route
adminRoute.post("/teacherSignup", adminServices.teacherSignup); //Teacher Signup Route
adminRoute.post("/getTeachersList", adminServices.getTeachersList); //Teacher Signup Route
adminRoute.post("/getAdminDataById", adminServices.getAdminDataById); //Teacher Signup Route
adminRoute.post("/getTeacherDashboard", adminServices.getTeacherDashboard); //Teacher Dashboard Route
adminRoute.post("/getAdminDashboard", adminServices.getAdminDashboard); //Admin Dashboard Route
adminRoute.post("/getAttendanceReport", adminServices.getAttendanceReport); //Attenance Report Route

export default adminRoute;