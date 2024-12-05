import mongoose from "mongoose";
import env from "dotenv";

env.config();

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected");
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (err) {
        console.err("ERROR ON DATABASE => ", err.message);
    }
}
