// const express = require("express");
import express from "express";
import connectDB from "./db.js";
import http from "http";
import dotenv from "dotenv";

import adminRoute from "./Route/adminRoute.js";

const app = express();
dotenv.config();
connectDB();

const server = http.createServer(app);

app.use("/api/admin", adminRoute)
app.use("/{*any}", (req, res) => {
    return res.json({ code: 400, message: "not found" });
});

// const mongoDBConn = "mongodb://localhost:27017/eCom";
const start = async () => {
    try {
        server.listen(8080, () => {
            console.log("Server Port 8080");
        });
    } catch (err) {
        console.log(err.message);
    }
};

start();