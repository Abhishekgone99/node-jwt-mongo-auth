import { UserModel } from "../models/usersSchema.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { transporter } from "../config/emailConfig.js"



export const userRegistration = async (req, res) => {
    try {
        //get user input
        const { firstName, lastName, email, password, confirmPassword } = req.body

        //validate user input
        if (!(firstName && lastName && email && password && confirmPassword)) {
            return res.status(400).send({ status: "failed", message: "All input fields are required" })
        }

        //check if user exits
        const user = await UserModel.findOne({ email: email })
        if (user) {
            return res.status(409).send({ status: "failed", message: "User already exists" })
        }

        //validate passwords
        if (password !== confirmPassword) {
            return res.status(400).send({ status: "failed", message: "password and confirmPassword does not match" })
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        //create user and add to database
        const newUser = new UserModel({
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase(),
            password: hashedPassword
        })

        await newUser.save()

        const saved_user = await UserModel.findOne({ email: email })
        // generate JWT token
        const token = jwt.sign({ userID: saved_user._id, email }, process.env.JWT_SECRET_KEY, { expiresIn: "24h" })
        res.status(201).send({ status: "success", message: "User Registered successfully", token: token })

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}


export const userLogin = async (req, res) => {
    try {

        //get user input
        const { email, password } = req.body

        //validate user input
        if (!(email && password)) {
            return res.status(400).send({ status: "failed", message: "email and password required" })
        }

        // check if user exists
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return res.status(400).send({ status: "failed", message: "User is not registered" })
        }

        //generate JWT token
        const token = jwt.sign({ userID: user._id, email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })
        // check password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if ((user.email === email) && isPasswordValid) {
            return res.status(200).send({ status: "success", message: "Login Successfully", token: token })
        } else {
            return res.status(401).send({ status: "failed", message: "email or password is incorrect" })
        }


    } catch (err) {
        res.status(400).json({ status: "error", message: err })
    }
}

export const changeUserPassword = async (req, res) => {
    try {
        // get user input
        const { password, confirm_password } = req.body

        // validate user input
        if (!(password && confirm_password)) {
            return res.status(400).send("All input fields are required")
        }

        //validate passwords
        if (password !== confirm_password) {
            return res.status(400).send("password and confirm_password doesn't match")
        }

        // hash the password
        const newHashedPassword = await bcrypt.hash(password, 10)

        // save the password in databse
        await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashedPassword } })

        res.status(200).send({ status: "success", message: "Password changed successfully" })
    } catch (err) {
        res.status(400).send({ status: "error", message: err })
    }
}


export const loggedUser = async (req, res) => {
    try {
        const authUser = req.user
        res.send({ user: authUser })
    } catch (err) {
        res.status(400).send({ status: "error", message: err })
    }
}


export const forgotPasswordEmail = async (req, res) => {
    try {
        // get user input
        const { email } = req.body

        // validate user input
        if (!email) {
            return res.status(400).send("Email is required")
        }

        // check if email exists
        const user = await UserModel.findOne({ email: email })
        console.log(user._id);
        if (!user) {
            return res.status(400).send("Email doesn't exists")
        }

        // generate a reset Link jwt token
        const resetToken = jwt.sign({ UserID: user._id, email }, process.env.RESET_KEY, { expiresIn: '15m' })

        // reset link
        const link = `http://localhost:8000/api/user/resetPassword/${user._id}/${resetToken}`
        console.log(link);


        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: process.env.EMAIL_FROM, // sender address
            to: user.email, // list of receivers
            subject: "Password Reset Link", // Subject line
            html: `<a href=${link} >Click Here</a> to reset your password`, // html body
        });

        res.status(200).send({ status: "success", message: "Password reset email sent... please check your email", info })
    } catch (err) {
        res.status(400).send({ status: "error", message: err })
    }
}


export const resetPassword = async (req, res) => {
    try {
        // get user inputs
        const { password, confirm_password } = req.body
        // get id and token from url
        const { id, resetToken } = req.params
        console.log(req.params);


        // find user
        const user = await UserModel.findById(id)
        console.log(user);

        // verify token
        jwt.verify(resetToken, process.env.RESET_KEY)

        // validate user input
        if (!(password && confirm_password)) {
            return res.status(400).send("All input fields are required")
        }

        //validate passwords
        if (password !== confirm_password) {
            return res.status(400).send("password and confirm_password doesn't match")
        }

        // hash new password
        const newHashedPassword = await bcrypt.hash(password, 10)

        // save password in database
        await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashedPassword } })

        res.status(200).send({ status: "success", message: "Password changed successfully" })
    } catch (err) {
        res.status(400).send({ status: "error", message: err })
    }
}