// const handler = require("express-async-handler");
// const mongoose = require("mongoose");
import asyncHandler from "express-async-handler";
import mongoose from "mongoose"
//
import User from "../Model/user.model.js";
const adminController = {};

// --> "/api/user/getUserList";
//GET --> http://localhost:8080/api/user/getUserList
adminController.getUserList = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = [];
    try {
        responseData = await User.find({});
    } catch (err) {
        responseCode = 400;
        responseMessage = "Failed";
    }
    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});

// --> "/api/user/manageUser";
//Insert
//GET --> http://localhost:8080/api/user/manageUser?id=0&firstName=Michel&lastName=Jack&phoneCode=+91&phoneNumber=9876567895&email=michel@gmail.com
//Update
//GET --> http://localhost:8080/api/user/manageUser?id=696b1a6024b3fe8fb9fc7e59&firstName=New%20Val&lastName=Jack&phoneCode=+91&phoneNumber=9876567895&email=michel@gmail.com
adminController.manageUser = asyncHandler(async (req, res) => {
    let responseCode = 200,
        responseMessage = "Success",
        responseData = [];
    try {
        if (req.query.id == 0) {
            responseData = await User.create({
                firstName: req.query.firstName,
                lastName: req.query.lastName,
                phoneCode: req.query.phoneCode,
                phoneNumber: req.query.phoneNumber,
                email: req.query.email,
            });
        } else {
            responseData = await User.findByIdAndUpdate(
                // { _id: mongoose.Schema.ObjectId(req.query.id) },
                { _id: req.query.id },
                {
                    $set: {
                        firstName: req.query.firstName,
                        lastName: req.query.lastName,
                        phoneCode: req.query.phoneCode,
                        phoneNumber: req.query.phoneNumber,
                        email: req.query.email,
                    },
                },
                {
                    new: true,
                },
            );
        }
    } catch (err) {
        responseCode = 400;
        responseMessage = "Failed";
    }
    return res.json({
        code: responseCode,
        message: responseMessage,
        data: responseData,
    });
});
//----------
export default adminController;
