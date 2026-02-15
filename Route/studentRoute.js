import express from "express";
import studentServices from "../Services/studentServices.js";

const studentRoute = express.Router()

studentRoute.post("/manageStudent", studentServices.manageStudent); // Add and update Student
studentRoute.get("/getStudentsList", studentServices.getStudentsList); // Get Students List
studentRoute.get("/getStudentDataById", studentServices.getStudentDataById); // Get Single Student Data By Id

export default studentRoute;