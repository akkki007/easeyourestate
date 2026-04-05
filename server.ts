import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory map: userId -> socketId
const userSocketMap = new Map<string, string>();

async function main() {
    await app.prepare();

    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    // Make io accessible to API routes via global
    (global as any).io = io;

    io.on("connection", (socket) => {
        const userId = socket.handshake.auth?.userId as string;

        if (userId) {
            userSocketMap.set(userId, socket.id);
            socket.join(`user:${userId}`);
            console.log(`[Socket.io] User ${userId} connected`);
        }

        // Join a conversation room
        socket.on("join_conversation", (conversationId: string) => {
            socket.join(`conv:${conversationId}`);
        });

        // Leave a conversation room
        socket.on("leave_conversation", (conversationId: string) => {
            socket.leave(`conv:${conversationId}`);
        });

        socket.on("disconnect", () => {
            if (userId) {
                userSocketMap.delete(userId);
                console.log(`[Socket.io] User ${userId} disconnected`);
            }
        });
    });

    const PORT = parseInt(process.env.PORT || "3000", 10);

    httpServer.listen(PORT, () => {
        console.log(`> Ready on http://localhost:${PORT}`);
    });
}

main().catch(console.error);