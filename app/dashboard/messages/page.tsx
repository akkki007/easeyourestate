"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth, getUserDisplayName } from "@/lib/auth/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import { Send, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";

interface Participant {
    _id: string;
    name: { first?: string; last?: string } | string;
    avatar?: string;
    role?: string;
}

interface PropertyRef {
    _id: string;
    title: string;
    slug: string;
    location?: { locality?: string; city?: string };
    media?: { images?: Array<{ url: string }> };
}

interface Conversation {
    _id: string;
    participants: Participant[];
    propertyId?: PropertyRef;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount?: Record<string, number>;
}

interface Message {
    _id: string;
    conversationId: string;
    senderId: Participant | string;
    text: string;
    read: boolean;
    createdAt: string;
}

function getParticipantName(p: Participant) {
    if (!p?.name) return "User";
    if (typeof p.name === "string") return p.name || "User";
    return [p.name.first, p.name.last].filter(Boolean).join(" ").trim() || "User";
}

function getOtherParticipant(conv: Conversation, myId: string): Participant | null {
    return conv.participants.find((p) => p._id !== myId) || null;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
    const { user, token } = useAuth();
    const socket = useSocket();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [mobileView, setMobileView] = useState<"list" | "chat">("list");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const myId = user?._id?.toString() || "";

    // Fetch conversations list
    const fetchConversations = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch("/api/conversations", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setConversations(data.conversations || []);
        } catch {
            toast.error("Failed to load conversations");
        } finally {
            setLoadingConvs(false);
        }
    }, [token]);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    // Fetch messages for active conversation
    const fetchMessages = useCallback(async (convId: string) => {
        if (!token) return;
        setLoadingMsgs(true);
        try {
            const res = await fetch(`/api/conversations/${convId}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setMessages(data.messages || []);
        } catch {
            toast.error("Failed to load messages");
        } finally {
            setLoadingMsgs(false);
        }
    }, [token]);

    // Open a conversation
    const openConversation = useCallback((conv: Conversation) => {
        setActiveConv(conv);
        setMobileView("chat");
        fetchMessages(conv._id);

        if (socket) {
            // Leave previous room if any
            if (activeConv) socket.emit("leave_conversation", activeConv._id);
            socket.emit("join_conversation", conv._id);
        }
    }, [socket, activeConv, fetchMessages]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Socket.io real-time listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: { conversationId: string; message: Message }) => {
            if (activeConv && data.conversationId === activeConv._id) {
                setMessages((prev) => {
                    if (prev.some(m => m._id === data.message._id)) return prev;

                    const isMyMsg = typeof data.message.senderId === 'object' 
                        ? (data.message.senderId as any)._id === myId 
                        : data.message.senderId === myId;
                        
                    if (isMyMsg) {
                        const tempIndex = prev.findIndex(m => m._id.startsWith('temp-') && m.text === data.message.text);
                        if (tempIndex !== -1) {
                            const newPrev = [...prev];
                            newPrev[tempIndex] = data.message;
                            return newPrev;
                        }
                    }

                    return [...prev, data.message];
                });
            }
            // Update conversations list
            setConversations((prev) =>
                prev.map((c) =>
                    c._id === data.conversationId
                        ? { ...c, lastMessage: data.message.text, lastMessageAt: data.message.createdAt }
                        : c
                )
            );
        };

        const handleConvUpdated = (data: { conversationId: string; lastMessage: string; lastMessageAt: Date }) => {
            setConversations((prev) =>
                prev.map((c) =>
                    c._id === data.conversationId
                        ? { ...c, lastMessage: data.lastMessage, lastMessageAt: data.lastMessageAt?.toString() }
                        : c
                )
            );
        };

        socket.on("new_message", handleNewMessage);
        socket.on("conversation_updated", handleConvUpdated);

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("conversation_updated", handleConvUpdated);
        };
    }, [socket, activeConv, myId]);

    // Send message
    const sendMessage = async () => {
        if (!text.trim() || !activeConv || sending) return;

        const msgText = text.trim();
        setText("");
        setSending(true);

        // Optimistic update
        const tempMsg: Message = {
            _id: `temp-${Date.now()}`,
            conversationId: activeConv._id,
            senderId: myId,
            text: msgText,
            read: false,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);

        try {
            const res = await fetch(`/api/conversations/${activeConv._id}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: msgText }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessages((prev) => prev.map((m) => m._id === tempMsg._id ? data.message : m));
            } else {
                setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
                toast.error("Failed to send message");
            }
        } catch {
            setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getSenderId = (msg: Message) => {
        if (typeof msg.senderId === "string") return msg.senderId;
        return (msg.senderId as Participant)._id;
    };

    const getSenderAvatar = (msg: Message) => {
        if (typeof msg.senderId === "object") return (msg.senderId as Participant).avatar;
        return undefined;
    };

    const getSenderName = (msg: Message) => {
        if (typeof msg.senderId === "object") return getParticipantName(msg.senderId as Participant);
        return "User";
    };

    return (
        <div className="flex flex-col h-screen">
            <DashboardHeader
                userName={getUserDisplayName(user)}
                userEmail={typeof user?.email === "string" ? user.email : ""}
                userRole={typeof user?.role === "string" ? user.role : ""}
            />

            <div className="flex flex-1 overflow-hidden bg-background">
                {/* Conversations Sidebar */}
                <aside
                    className={`
            w-full md:w-80 lg:w-96 border-r border-border flex-shrink-0 flex flex-col
            ${mobileView === "chat" ? "hidden md:flex" : "flex"}
          `}
                >
                    <div className="p-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-accent" />
                            Messages
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingConvs ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="w-14 h-14 rounded-full bg-hover flex items-center justify-center mb-4">
                                    <MessageSquare className="w-7 h-7 text-muted-foreground" />
                                </div>
                                <p className="text-foreground font-medium mb-1">No messages yet</p>
                                <p className="text-muted-foreground text-sm">
                                    Contact a property owner to start a conversation
                                </p>
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const other = getOtherParticipant(conv, myId);
                                const unread = conv.unreadCount?.[myId] || 0;
                                const isActive = activeConv?._id === conv._id;

                                return (
                                    <button
                                        key={conv._id}
                                        onClick={() => openConversation(conv)}
                                        className={`
                      w-full text-left p-4 flex gap-3 hover:bg-hover transition-colors border-b border-border/50
                      ${isActive ? "bg-accent/10 border-l-2 border-l-accent" : ""}
                    `}
                                    >
                                        {/* Avatar */}
                                        <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {other?.avatar ? (
                                                <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-accent font-semibold text-sm">
                                                    {getParticipantName(other!).charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm text-foreground truncate">
                                                    {other ? getParticipantName(other) : "Unknown"}
                                                </p>
                                                {conv.lastMessageAt && (
                                                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                                        {timeAgo(conv.lastMessageAt)}
                                                    </span>
                                                )}
                                            </div>

                                            {conv.propertyId && (
                                                <p className="text-xs text-accent truncate mt-0.5">
                                                    {conv.propertyId.title}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-0.5">
                                                <p className="text-xs text-muted-foreground truncate flex-1">
                                                    {conv.lastMessage || "No messages yet"}
                                                </p>
                                                {unread > 0 && (
                                                    <span className="ml-2 w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0">
                                                        {unread > 9 ? "9+" : unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Chat Area */}
                <main
                    className={`
            flex-1 flex flex-col overflow-hidden
            ${mobileView === "list" ? "hidden md:flex" : "flex"}
          `}
                >
                    {activeConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
                                <button
                                    onClick={() => setMobileView("list")}
                                    className="md:hidden p-1 rounded-lg hover:bg-hover transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                {(() => {
                                    const other = getOtherParticipant(activeConv, myId);
                                    return (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {other?.avatar ? (
                                                    <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-accent font-semibold">
                                                        {other ? getParticipantName(other).charAt(0).toUpperCase() : "?"}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground text-sm">
                                                    {other ? getParticipantName(other) : "Unknown"}
                                                </p>
                                                {activeConv.propertyId && (
                                                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                        Re: {activeConv.propertyId.title}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loadingMsgs ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-accent" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground text-sm">
                                        No messages yet. Say hello!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = getSenderId(msg) === myId;
                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                            >
                                                {!isMe && (
                                                    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mr-2 flex-shrink-0 self-end overflow-hidden">
                                                        {getSenderAvatar(msg) ? (
                                                            <img src={getSenderAvatar(msg)} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs text-accent font-semibold">
                                                                {getSenderName(msg).charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="max-w-xs md:max-w-md lg:max-w-lg">
                                                    <div
                                                        className={`
                              px-4 py-2.5 rounded-2xl text-sm
                              ${isMe
                                                                ? "bg-accent text-white rounded-br-sm"
                                                                : "bg-card border border-border text-foreground rounded-bl-sm"
                                                            }
                            `}
                                                    >
                                                        {msg.text}
                                                    </div>
                                                    <p className={`text-xs text-muted-foreground mt-1 ${isMe ? "text-right" : "text-left"}`}>
                                                        {timeAgo(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-border bg-card">
                                <div className="flex items-end gap-3">
                                    <textarea
                                        ref={inputRef}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message... (Enter to send)"
                                        rows={1}
                                        className="flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors max-h-32 min-h-[44px]"
                                        style={{ overflowY: text.includes("\n") ? "auto" : "hidden" }}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!text.trim() || sending}
                                        className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                                    Press Enter to send, Shift+Enter for new line
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-20 h-20 rounded-full bg-hover flex items-center justify-center mb-4">
                                <MessageSquare className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Your Messages</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                Select a conversation on the left to read and reply to messages. Real-time chat with property owners and buyers.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}