import dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer"


// create reusable transporter object using the default SMTP transport
export let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})


