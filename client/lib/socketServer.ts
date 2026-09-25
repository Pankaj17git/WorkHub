import { io, Socket } from "socket.io-client";
import { getToken } from "./auth-client";

export const socket: Socket = io({
  autoConnect: typeof window !== "undefined",
  auth: (cb) => {
    const token = typeof window !== "undefined" ? getToken() : null;
    cb({ token });
  },
});
// 