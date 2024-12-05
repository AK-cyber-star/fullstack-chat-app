import Express from "express";
import cors from "cors";
import env from "dotenv";
import cookieParser from "cookie-parser";

import path from "path";

// routes
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"

// lib
import { connectDB } from "./lib/database.js";
import { app, server} from "./lib/socket.js";

env.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(Express.json());
app.use(Express.urlencoded({extended : true}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(Express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });

}

server.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
    connectDB();
})