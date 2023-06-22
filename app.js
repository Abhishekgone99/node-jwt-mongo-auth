import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import connectDB from "./config/connectdb.js"
import userRoutes from "./routes/userRoutes.js"


// express app
const app = express()
const { API_PORT } = process.env
const port = process.env.PORT || API_PORT

// connecting databse to app
const { MONGO_URI } = process.env
connectDB(MONGO_URI)

// parsing  json data coming from POST and PUT request to javascript objectn
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//cors policy will be effective when frontend is connected to backend
app.use(cors())
// load routes
app.use("/api/user", userRoutes)



// listening to server
app.listen(port, () => {
    console.log(`Listening to the server at  http://localhost:${port}`)
})