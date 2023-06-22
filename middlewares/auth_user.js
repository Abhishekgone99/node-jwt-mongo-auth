import jwt from 'jsonwebtoken'
import { UserModel } from '../models/usersSchema.js'




//verify token

export const checkUserAuth = async (req, res, next) => {
    let token
    const { authorization } = req.headers

    if (authorization && authorization.startsWith('Bearer')) {
        try {
            // get token from header
            token = authorization.split(" ")[1]

            //verify token
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            // get/decode user from the token
            req.user = await UserModel.findById(userID).select("-password")

            next()
        } catch (err) {
            return res.status(403).send({ status: "failed", message: "unauthorized user" })
        }
    }

    // check if token exists
    if (!token) {
        return res.status(401).send({ status: "failed", message: "Access deneid Token is missing" })
    }

}