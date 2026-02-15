import auth from "../middlewares/authMiddleware.js";
import attendanceController from "../Controller/attendanceController.js";

const attendanceServices = {};

attendanceServices.manageAttendance = [
    auth.authorize({
        auth: { required: true },
        access: ["TEACHER"],
    }),
    attendanceController.manageAttendance,
];

attendanceServices.getAttendanceListByDate = [
    auth.authorize({
        auth: { required: true },
        access: ["TEACHER"],
    }),
    attendanceController.getAttendanceListByDate,
];

attendanceServices.getAttendanceDataByDate = [
    auth.authorize({
        auth: { required: true },
        access: ["TEACHER"],
    }),
    attendanceController.getAttendanceDataByDate,
];

export default attendanceServices;