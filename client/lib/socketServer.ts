import { io, Socket } from "socket.io-client";
import { getToken } from "./auth-client";

export const socket: Socket = io({
  autoConnect: typeof window !== "undefined",
  auth: (cb) => {
    const token = typeof window !== "undefined" ? getToken() : null;
    cb({ token });
  },
});

export function syncSocketAuth(token?: string | null) {
  if (typeof window === "undefined") return;
  const currentToken = token !== undefined ? token : getToken();
  if (!socket.connected) {
    socket.connect();
  }
  if (currentToken) {
    socket.emit("auth:authenticate", currentToken);
  }
}

if (typeof window !== "undefined") {
  socket.on("connect", () => {
    const token = getToken();
    if (token) {
      socket.emit("auth:authenticate", token);
    }
  });
}