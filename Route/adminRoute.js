import express from "express";
import adminController from "../Controller/adminController.js"

const adminRoute = express.Router()

adminRoute.get("/config", adminController.getUserList);
adminRoute.get("/manageUser", adminController.manageUser);

export default adminRoute