import { io } from "socket.io-client";

const SOCKET_URL =
   import.meta.env.VITE_API_BASE_URL;

const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Socket disconnected");
});

export default socket;
