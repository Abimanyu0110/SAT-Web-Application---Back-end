import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";

// Route files
import adminRoute from "./Route/adminRoute.js";
import studentRoute from "./Route/studentRoute.js";
import attendanceRoute from "./Route/attendanceRoute.js";


dotenv.config();

const app = express();

const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/admin", adminRoute);
app.use("/api/student", studentRoute);
app.use("/api/attendance", attendanceRoute);

// Backend Start function
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