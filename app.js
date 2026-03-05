import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";

// Route files
import adminRoute from "./Route/adminRoute.js";
import studentRoute from "./Route/studentRoute.js";
import attendanceRoute from "./Route/attendanceRoute.js";

const PORT = process.env.PORT || 8080;

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
        server.listen(PORT, () => {
            console.log(`Server Port ${PORT}`);
        });
    } catch (err) {
        console.log(err.message);
    }
};

start();