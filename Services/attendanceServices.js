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

// attendanceServices.teacherSignup = [
//     auth.authorize({
//         auth: { required: true },
//         access: ["ADMIN"],
//     }),
//     adminController.manageSignup,
// ];

// attendanceServices.login = [
//     auth.authorize({
//         auth: { required: false },
//         // access: ["ADMIN", "TEACHER"],
//     }),
//     adminController.login,
// ];

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