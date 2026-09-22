import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface AuthPayload {
  userId: string;
  email?: string;
  role?: string;
  sub?: string;
}

function extractTokenFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|; )\s*wh_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function resolveUserId(socket: Socket, token?: string): string | null {
  const currentUserId = (socket as any).userId;
  if (currentUserId) return currentUserId.toString();

  const rawToken =
    token ||
    (socket.handshake.auth?.token as string | undefined) ||
    extractTokenFromCookie(socket.handshake.headers.cookie);

  if (!rawToken || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET) as AuthPayload;
    const resolvedId = decoded.userId || decoded.sub;
    if (resolvedId) {
      (socket as any).userId = resolvedId;
      return resolvedId.toString();
    }
  } catch {
    // token verification failed
  }
  return null;
}

export const initSocketServer = (io: Server) => {
  console.log("the socket is initialized")
  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ||
        extractTokenFromCookie(socket.handshake.headers.cookie);

      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthPayload;
        const uid = decoded.userId || decoded.sub;
        if (uid) {
          (socket as any).userId = uid.toString();
        }
      }
      next();
    } catch {
      // Continue connection even if initial token is absent or invalid; 
      // individual message/room events will validate credentials.
      next();
    }
  });

  io.on("connection", (socket: Socket) => {
    const initialUserId = resolveUserId(socket);
    if (initialUserId) {
      socket.join(`user:${initialUserId}`);
      console.log(`[Socket] User connected: ${initialUserId}`);
    } else {
      console.log(`[Socket] Client connected: ${socket.id}`);
    }

    // Manual client authentication
    socket.on("auth:authenticate", (token: string) => {
      const uid = resolveUserId(socket, token);
      if (uid) {
        socket.join(`user:${uid}`);
        socket.emit("auth:success", { userId: uid });
      } else {
        socket.emit("auth:error", { message: "Invalid authentication token" });
      }
    });

    // Join conversation room
    socket.on("conversation:join", async (conversationId: string | number) => {
      try {
        if (!conversationId) return;
        const convStr = conversationId.toString();
        const uid = resolveUserId(socket);

        if (uid) {
          const isMember = await prisma.conversationMember.findUnique({
            where: {
              conversationId_userId: {
                conversationId: BigInt(convStr),
                userId: BigInt(uid),
              },
            },
          });

          if (!isMember) {
            socket.emit("conversation:error", { message: "Not a member of this conversation" });
            return;
          }
        }

        socket.join(`conversation:${convStr}`);
        socket.join(convStr);
      } catch (err) {
        console.error("[Socket] Failed to join conversation:", err);
      }
    });

    // Leave conversation room
    socket.on("conversation:leave", (conversationId: string | number) => {
      if (!conversationId) return;
      const convStr = conversationId.toString();
      socket.leave(`conversation:${convStr}`);
      socket.leave(convStr);
    });

    // Send message via Socket
    socket.on(
      "message:send",
      async (data: {
        conversationId?: string | number;
        activeConvId?: string | number;
        message?: string;
        content?: string;
        outgoingText?: string;
        token?: string;
      }) => {
        try {
          const rawConvId = data.conversationId ?? data.activeConvId;
          const rawText = data.message ?? data.content ?? data.outgoingText;
          console.log("received message",data);

          if (!rawConvId) {
            return socket.emit("message:error", { error: "Conversation ID is required" });
          }

          if (!rawText || !rawText.trim()) {
            return socket.emit("message:error", { error: "Message content cannot be empty" });
          }

          const convStr = rawConvId.toString();
          const cleanText = rawText.trim();
          const uid = resolveUserId(socket, data.token);

          if (!uid) {
            return socket.emit("message:error", { error: "Unauthorized: Please log in" });
          }

          const convIdBigInt = BigInt(convStr);
          const userIdBigInt = BigInt(uid);

          // Verify conversation membership
          const isMember = await prisma.conversationMember.findUnique({
            where: {
              conversationId_userId: {
                conversationId: convIdBigInt,
                userId: userIdBigInt,
              },
            },
          });

          if (!isMember) {
            return socket.emit("message:error", {
              error: "Forbidden: You are not a member of this conversation",
            });
          }

          // Persist message to database
          const savedMessage = await prisma.message.create({
            data: {
              conversationId: convIdBigInt,
              senderId: userIdBigInt,
              message: cleanText,
              messageType: "TEXT",
            },
            include: {
              sender: {
                select: { id: true, name: true, profileImage: true },
              },
            },
          });

          // Touch conversation updatedAt
          await prisma.conversation.update({
            where: { id: convIdBigInt },
            data: { updatedAt: new Date() },
          });

          const formattedMessage = {
            id: savedMessage.id.toString(),
            conversationId: savedMessage.conversationId.toString(),
            senderId: savedMessage.senderId.toString(),
            message: savedMessage.message,
            messageType: savedMessage.messageType,
            createdAt: savedMessage.createdAt.toISOString(),
            sender: savedMessage.sender
              ? {
                  id: savedMessage.sender.id.toString(),
                  name: savedMessage.sender.name,
                  profileImage: savedMessage.sender.profileImage,
                }
              : undefined,
          };

          // Broadcast message to room members
          io.to(`conversation:${convStr}`).to(convStr).emit("message:new", formattedMessage);

          // Clear any active typing status for this sender in the conversation
          socket.to(`conversation:${convStr}`).to(convStr).emit("typing:update", {
            conversationId: convStr,
            userId: uid.toString(),
            typing: false,
          });

          // Notify conversation members for live conversation list updates
          const members = await prisma.conversationMember.findMany({
            where: { conversationId: convIdBigInt },
            select: { userId: true },
          });

          for (const member of members) {
            io.to(`user:${member.userId.toString()}`).emit("conversation:updated", {
              conversationId: convStr,
              lastMessage: formattedMessage.message,
              updatedAt: formattedMessage.createdAt,
            });
          }
        } catch (err: any) {
          console.error("[Socket] message:send error:", err);
          socket.emit("message:error", {
            error: err?.message || "Failed to process message",
          });
        }
      }
    );

    // Typing indicators
    socket.on(
      "typing:start",
      (data: {
        conversationId?: string | number;
        userId?: string;
        userName?: string;
      }) => {
        if (!data?.conversationId) return;
        const convStr = data.conversationId.toString();
        const uid = resolveUserId(socket) || data.userId;
        if (!uid) return;

        socket.to(`conversation:${convStr}`).to(convStr).emit("typing:update", {
          conversationId: convStr,
          userId: uid.toString(),
          userName: data.userName,
          typing: true,
        });
        console.log(`[Socket] User ${uid} started typing in conversation ${convStr}`);
      }
    );

    socket.on(
      "typing:stop",
      (data: {
        conversationId?: string | number;
        userId?: string;
      }) => {
        if (!data?.conversationId) return;
        const convStr = data.conversationId.toString();
        const uid = resolveUserId(socket) || data.userId;
        if (!uid) return;

        socket.to(`conversation:${convStr}`).to(convStr).emit("typing:update", {
          conversationId: convStr,
          userId: uid.toString(),
          typing: false,
        });
        console.log(`[Socket] User ${uid} stopped typing in conversation ${convStr}`);
      }
    );

    socket.on("disconnect", () => {
      const uid = (socket as any).userId;
      if (uid) {
        console.log(`[Socket] User disconnected: ${uid}`);
      }
    });
  });
};

// Backwards compatibility alias
export const connectSocket = initSocketServer;

