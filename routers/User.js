import express from "express";

import { addTask, forgotPassword, getMyProfile, login, logout, register, removeTask, resetPassword, updatePassword, updateProfile, updateTask, verify } from "../controllers/User.js";
import { isAuthenticated } from "../midddleware/auth.js";



const router = express.Router()

router.route("/register").post(register)


router.route("/login").post(login)

router.route("/verify").post(isAuthenticated, verify)

router.route("/logout").get(logout)

router.route("/newtask").post(isAuthenticated, addTask)

router.route("/task/:taskId").get(isAuthenticated, updateTask).delete(isAuthenticated, removeTask)

router.route("/me").get(isAuthenticated, getMyProfile)

router.route("/updateProfile").put(isAuthenticated, updateProfile)

router.route("/updatePassword").put(isAuthenticated, updatePassword)

router.route("/forgotPassword").post(forgotPassword)

router.route("/resetPassword").put(resetPassword)




export default router