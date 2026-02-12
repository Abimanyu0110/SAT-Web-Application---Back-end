import auth from "../middlewares/authMiddleware.js";
import adminController from "../Controller/adminController.js"

const adminServices = {};

adminServices.adminSignup = [
    auth.authorize({
        auth: { required: false },
        // access: ["ADMIN", "TEACHER"],
    }),
    adminController.manageSignup,
];

adminServices.teacherSignup = [
    auth.authorize({
        auth: { required: true },
        access: ["ADMIN"],
    }),
    adminController.manageSignup,
];

adminServices.login = [
    auth.authorize({
        auth: { required: false },
        // access: ["ADMIN", "TEACHER"],
    }),
    adminController.login,
];

adminServices.getTeachersList = [
    auth.authorize({
        auth: { required: true },
        access: ["ADMIN"],
    }),
    adminController.getTeachersList,
];

adminServices.getAdminDataById = [
    auth.authorize({
        auth: { required: true },
        access: ["ADMIN"],
    }),
    adminController.getAdminDataById,
];

adminServices.getTeacherDashboard = [
    auth.authorize({
        auth: { required: true },
        access: ["TEACHER"],
    }),
    adminController.getTeacherDashboard,
]

adminServices.getAdminDashboard = [
    auth.authorize({
        auth: { required: true },
        access: ["ADMIN"],
    }),
    adminController.getAdminDashboard,
]

adminServices.getAttendanceReport = [
    auth.authorize({
        auth: { required: true },
        access: ["ADMIN", "TEACHER"],
    }),
    adminController.getAttendanceReport,
]

export default adminServices;