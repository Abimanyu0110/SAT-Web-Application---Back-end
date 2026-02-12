import auth from "../middlewares/authMiddleware.js";
import studentController from "../Controller/studentController.js";

const studentServices = {};

studentServices.manageStudent = [
    auth.authorize({
        auth: { required: true },
        access: ["ADMIN"],
    }),
    studentController.manageStudent,
];

studentServices.getStudentsList = [
    auth.authorize({
        auth: { required: true },
        access: ["ADMIN", "TEACHER"],
    }),
    studentController.getStudentsList,
];

studentServices.getStudentDataById = [
    auth.authorize({
        auth: { required: true },
        access: ["ADMIN","TEACHER"],
    }),
    studentController.getStudentDataById,
];

// studentServices.login = [
//     auth.authorize({
//         auth: { required: false },
//         // access: ["ADMIN", "TEACHER"],
//     }),
//     adminController.login,
// ];

export default studentServices;