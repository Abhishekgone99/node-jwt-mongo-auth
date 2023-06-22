import mongoose from "mongoose";




const connectDB = async (MONGO_URI) => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log("connected to database successfully");
    } catch (err) {
        console.log("database connection failed. exiting now...");
        console.error(err)
    }
}

export default connectDB


