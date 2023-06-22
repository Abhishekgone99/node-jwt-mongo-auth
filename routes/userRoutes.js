import express from "express"
import { changeUserPassword, forgotPasswordEmail, loggedUser, resetPassword, userLogin, userRegistration } from "../controlllers/userController.js"
import { checkUserAuth } from "../middlewares/auth_user.js"

const router = express.Router()

// Route level Middleware - to protrct route
router.use("/changePassword", checkUserAuth)

// public routes
router.post("/register", userRegistration)
router.post("/login", userLogin)
router.post("/forgotPassword", forgotPasswordEmail)
router.post("/resetPassword/:id/:resetToken", resetPassword)



// protected routes
router.post("/changePassword", changeUserPassword)
router.get("/profile", checkUserAuth, loggedUser)


export default router