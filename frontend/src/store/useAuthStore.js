import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// returns a inital object
export const useAuthStore = create((set, get) => ({

    authUser : null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers : [],
    isCheckingAuth: true,
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check");

            set({ authUser : response.data });
            get().connectSocket();

        } catch (err) {
            console.error("ERROR in useAuthStore: ", err.message);
            set({ authUser : null })
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosInstance.post("/auth/signup", data);
            set({ authUser: response.data });
            toast.success("Account created successfully");
            get().connectSocket();
            
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoggingIn: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().diconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile : true });
        try {

            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser : res.data });
            toast.success("Profile updated successfully");

        } catch (error) {
            console.log("Error in update profile.");
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id, // passing the userId to backend
            },
        });
        socket.connect()

        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        })
    },

    diconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect(); 
    },

}));