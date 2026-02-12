import express from "express";
import studentServices from "../Services/studentServices.js";

const studentRoute = express.Router()

studentRoute.post("/manageStudent", studentServices.manageStudent); // Add and update Student Route
studentRoute.post("/getStudentsList", studentServices.getStudentsList); // Add and update Student Route
studentRoute.post("/getStudentDataById", studentServices.getStudentDataById); // Admin Signup Route
// adminRoute.post("/teacherSignup", adminServices.teacherSignup); //Teacher Signup Route
// adminRoute.post("/getTeachersList", adminServices.getTeachersList); //Teacher Signup Route

export default studentRoute;