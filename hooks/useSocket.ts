"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth/AuthContext";

let globalSocket: Socket | null = null;

export function useSocket() {
    const { user, token } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!token || !user?._id) return;

        if (!globalSocket || !globalSocket.connected) {
            globalSocket = io({
                auth: { userId: user._id },
                transports: ["websocket", "polling"],
            });
        }

        socketRef.current = globalSocket;

        return () => {
            // Don't disconnect on unmount — keep it alive for the session
        };
    }, [token, user?._id]);

    return socketRef.current || globalSocket;
}