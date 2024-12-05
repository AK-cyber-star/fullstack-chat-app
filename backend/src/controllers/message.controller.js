import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Get all the user except the logged In user and returning all fieldss excluding password field.
        const filteredUsers = await User.find({
            _id : { $ne: loggedInUserId } // where id not equal to logged In user
        }).select("-password");

        res.status(200).json(filteredUsers);

    } catch (err) {
        console.error("ERROR in getUsersForSidebar controller: ", err.message);
        res.status(500).json({ message : "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {

        const { id : userToChatId } = req.params;
        const myId = req.user._id;

        const message = await Message.find({
            $or : [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(message);
        
    } catch (err) {
        console.error("ERROR in getMessage controller: ", err.message);
        res.status(500).json({ message : "Internal Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        console.log("SEND MESSAGE PARAMS => ", req.params)
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl; // undefined intially
        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // realtime message delivery => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage); // sends message only to the receiver
        }

        res.status(201).json(newMessage);

    } catch (err) {
        console.error("ERROR in sendMessage controller: ", err.message);
        res.status(500).json({ message : "Internal Server Error" });
    }
};