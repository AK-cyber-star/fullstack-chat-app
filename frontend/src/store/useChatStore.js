import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages : [],
    users : [],
    selectedUser : null,
    isUsersLoading : false,
    isMessagesLoading: false,

    getUsers : async () => {
        set({ isUsersLoading : true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users : res.data });
        } catch (error) {
            console.error(error.response.data.message);
        } finally {
            set({ isUsersLoading : false });
        }
    },

    getMessages : async (userId) => {
        set({ isMessagesLoading : true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages : res.data })
        } catch (error) {
            console.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading : false });
        }
    },

    sendMessage : async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages : [...messages, res.data] });
        } catch (error) {
            console.error(error.response.data.error);
        } 
    },

    subscribeToMessages : () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        // grab the socket from useAuthStore state
        const socket = useAuthStore.getState().socket;

        // TODO: optimize this one later
        socket.on("newMessage", (newMessage) => {
            // prevent sending from other users rather than selected user
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            // update the messages array
            set({ 
                messages: [...get().messages, newMessage], 
            })
        })
    },

    unsubscribeFromMessages : () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser : (selectedUser) => set({  selectedUser }),

}));