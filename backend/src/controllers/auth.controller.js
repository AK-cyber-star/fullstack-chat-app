import bcrypt from "bcryptjs"
import User from "../models/user.model.js";
import { generateToken } from "../lib/utlis.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    console.log("DATA RECEIVED => ", req.body)
    const {fullName, email, password} = req.body;
    try {
        if (password.length < 6) {
            return res.status(400).json({message : "Password must be at least 6 characters"});
        }

        const user = await User.findOne({email});

        if (user) return res.status(400).json({ message: "Email already exist" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword
        });

        if (newUser) {
            // generate jwt token
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({ 
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            });
            
        } else {
            res.status(400).json({message : "Invalid user data"});
        }

    } catch (err) {
        console.error("Error in signup controller", err.message);
        res.status(500).json({ message : "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        
        const user = await User.findOne({email});

        if(!user) return res.status(400).json({ message : "Invalid Credentials" });

        // compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message : "Invalid Credentials" });

        generateToken(user._id, res);

        res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic: user.profilePic
        });
        
    } catch (err) {
        console.error("ERROR in login controller", err.message);
        res.status(500).json({ message : "Internal Server Error" });
    }
}

export const logout = async (req, res) => {
    try {
        // clear out cookies
        res.cookie("jwt", "", { maxAge : 0 });
        res.status(200).json({ message : "Logged out successfully" });
        
    } catch (err) {
        console.err("ERROR at logout controller", err.message);
        res.status(500).json({ message : "Internal Server Error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) return res.status(400).json({ message : "Profile pic is required"});

        const uploadRespose = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { profilePic : uploadRespose.secure_url },
            { new : true } // returns a new updated object instead of document 
        );

        res.status(200).json(updatedUser);
 
    } catch (err) {
        console.error("Error in updateProfile controller: ", err.message);
        res.status(500).json({ message : "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (err) {
        console.error("ERROR in checkAuth controller: ", err.message);
        res.status(500).json({ message : "Internal Server Error" });
    }
};