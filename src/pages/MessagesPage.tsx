import { useEffect, useRef, useState } from "react";
import { Send, Search, MessageCircle } from "lucide-react";

import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCounts,
} from "../services/message.service";

import { getUserIdFromToken } from "../utils/auth";
import socket from "../socket";
import { useLocation } from "react-router-dom";

const PAGE_SIZE = 20;

export function MessagesPage() {
  const myUserId = getUserIdFromToken();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const preselectedConversationId = location.state?.conversationId;
  const newConversationWith = location.state?.newConversationWith; // ✅ NEW: For starting new chats

  /* =========================
     STATE
     ========================= */
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null,
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ NEW: State for composing new message
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [newChatUser, setNewChatUser] = useState<any | null>(null);

  /* =========================
     HANDLE NEW CONVERSATION FROM USERCARD
     ========================= */
  useEffect(() => {
    if (newConversationWith) {
      // Set up a temporary "conversation" for sending the first message
      setIsComposingNew(true);
      setNewChatUser(newConversationWith);
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [newConversationWith]);

  /* =========================
     AUTO OPEN PRESELECTED CONVERSATION
     ========================= */
  useEffect(() => {
    if (!preselectedConversationId || conversations.length === 0) return;

    const conv = conversations.find((c) => c._id === preselectedConversationId);

    if (conv) {
      setIsComposingNew(false);
      setNewChatUser(null);
      handleSelectConversation(conv);
    }
  }, [conversations, preselectedConversationId]);

  /* =========================
     LOAD CONVERSATIONS
     ========================= */
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const [convRes, unreadRes] = await Promise.all([
          getConversations(),
          getUnreadCounts(),
        ]);

        const unreadMap = new Map(
          (unreadRes.data.conversations || []).map((c: any) => [
            c.conversationId,
            c.unreadCount,
          ]),
        );

        const enriched = (convRes.data.conversations || []).map(
          (conv: any) => ({
            ...conv,
            unreadCount: unreadMap.get(conv._id) || 0,
          }),
        );

        setConversations(enriched);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };

    loadConversations();
  }, []);

  /* =========================
     SOCKET LISTENERS
     ========================= */
  useEffect(() => {
    socket.on("message", ({ conversationId, message }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages((prev) => [...prev, message]);
        markMessagesAsRead(conversationId);
      }

      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: message,
                unreadCount:
                  selectedConversation?._id === conversationId
                    ? 0
                    : (c.unreadCount || 0) + 1,
              }
            : c,
        ),
      );
    });

    socket.on("message_read", ({ conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages((prev) => prev.map((m) => ({ ...m, seen: true })));
      }

      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, text: "" } : m,
        ),
      );
    });

    socket.on("typing_start", ({ conversationId, fromUserId }) => {
      if (
        selectedConversation?._id === conversationId &&
        fromUserId !== myUserId
      ) {
        setTypingUserId(fromUserId);
      }
    });

    socket.on("typing_stop", () => {
      setTypingUserId(null);
    });

    socket.on("user_online", (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socket.on("user_offline", (userId) => {
      setOnlineUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(userId);
        return copy;
      });
    });

    return () => {
      socket.off();
    };
  }, [selectedConversation, myUserId]);

  /* =========================
     SELECT CONVERSATION
     ========================= */
  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
    setIsComposingNew(false);
    setNewChatUser(null);
    setPage(1);

    try {
      const res = await getMessages(conversation._id);
      setMessages(res.data.messages || []);
      setHasMore((res.data.messages || []).length === PAGE_SIZE);

      await markMessagesAsRead(conversation._id);

      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversation._id ? { ...c, unreadCount: 0 } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  /* =========================
     LOAD MORE
     ========================= */
  const loadMoreMessages = async () => {
    if (!selectedConversation || !hasMore) return;

    const nextPage = page + 1;
    try {
      const res = await getMessages(selectedConversation._id);
      setMessages((prev) => [...(res.data.messages || []), ...prev]);
      setPage(nextPage);
      setHasMore((res.data.messages || []).length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to load more messages:", err);
    }
  };

  /* =========================
     SEND MESSAGE
     ========================= */
  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      let receiverId: string;

      // ✅ NEW: Handle new conversation
      if (isComposingNew && newChatUser) {
        receiverId = newChatUser.userId;
      } else if (selectedConversation) {
        const receiver = selectedConversation.participants.find((p: any) => {
          const pId = typeof p === "string" ? p : p._id;
          return pId !== myUserId;
        });
        receiverId = typeof receiver === "string" ? receiver : receiver?._id;
      } else {
        return;
      }

      if (!receiverId) return;

      const res = await sendMessage({
        receiverId,
        text: messageText,
      });

      setMessages((prev) => [...prev, res.data.message]);
      setMessageText("");

      // ✅ NEW: After first message in new chat, switch to conversation mode
      if (isComposingNew) {
        setIsComposingNew(false);
        // Reload conversations to get the newly created one
        const convRes = await getConversations();
        const conversations = convRes.data.conversations || [];
        setConversations(conversations);

        // Find and select the new conversation
        const newConv = conversations.find((c: any) =>
          c.participants.some((p: any) => {
            const pId = typeof p === "string" ? p : p._id;
            return pId === receiverId;
          }),
        );

        if (newConv) {
          setSelectedConversation(newConv);
          setNewChatUser(null);
        }
      }

      if (selectedConversation) {
        socket.emit("typing_stop", {
          conversationId: selectedConversation._id,
          toUserId: receiverId,
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  /* =========================
     TYPING HANDLER
     ========================= */
  const handleTyping = (value: string) => {
    setMessageText(value);

    if (!selectedConversation || isComposingNew) return;

    const receiverId = selectedConversation.participants.find((p: any) => {
      const pId = typeof p === "string" ? p : p._id;
      return pId !== myUserId;
    });

    const recId = typeof receiverId === "string" ? receiverId : receiverId?._id;

    if (!recId) return;

    socket.emit("typing_start", {
      conversationId: selectedConversation._id,
      toUserId: recId,
    });

    setTimeout(() => {
      socket.emit("typing_stop", {
        conversationId: selectedConversation._id,
        toUserId: recId,
      });
    }, 1000);
  };

  /* =========================
     AUTO SCROLL
     ========================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     DERIVED DATA
     ========================= */
  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p: any) => {
      const username = typeof p === "string" ? "" : p.username || "";
      return username.toLowerCase().includes(searchQuery.toLowerCase());
    }),
  );

  const selectedUser = isComposingNew
    ? newChatUser
    : selectedConversation
      ? selectedConversation.participants.find((p: any) => {
          const pId = typeof p === "string" ? p : p._id;
          return pId !== myUserId;
        })
      : null;

  const isUserOnline =
    selectedUser && onlineUsers.has(selectedUser._id || selectedUser.userId);

  const showChat = selectedConversation || isComposingNew;

  /* =========================
     JSX
     ========================= */
  return (
    <div className="h-[calc(100vh-2rem)] max-w-7xl mx-auto px-4 py-6">
      {!showChat ? (
        <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="text-center">
            <MessageCircle className="w-10 h-10 text-purple-600 mx-auto mb-2" />
            <p className="text-lg font-semibold">Select a conversation</p>
            <p className="text-sm text-gray-500 mt-1">
              Choose a conversation from the sidebar or start a new one
            </p>
          </div>
        </div>
      ) : (
        <div className="h-full bg-white rounded-xl flex flex-col border">
          {/* Header */}
          <div className="p-4 border-b">
            <p className="font-semibold">
              {selectedUser?.name || selectedUser?.username || "Unknown User"}
            </p>
            <p className="text-xs text-gray-500">
              {isComposingNew
                ? `@${selectedUser?.username}`
                : isUserOnline
                  ? "Online"
                  : "Offline"}
            </p>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            onScroll={(e) => {
              if (
                (e.target as HTMLDivElement).scrollTop === 0 &&
                !isComposingNew
              ) {
                loadMoreMessages();
              }
            }}
          >
            {isComposingNew && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p className="text-sm">
                  Start a conversation with {selectedUser?.name}
                </p>
              </div>
            ) : (
              messages.map((m) => {
                // ✅ Normalize senderId safely
                const senderId =
                  typeof m.sender === "string"
                    ? m.sender
                    : m.sender?._id || m.sender?.id;

                const isSent = senderId === myUserId;

                return (
                  <div
                    key={m._id}
                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                        isSent
                          ? "bg-purple-500 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{m.text}</p>

                      {isSent && (
                        <p className="text-[10px] text-right mt-1 opacity-80">
                          {m.seen ? "Seen ✓✓" : "Sent ✓"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {typingUserId && !isComposingNew && (
              <p className="text-xs text-gray-400">Typing…</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex gap-2">
            <input
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message…"
              className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className="bg-purple-500 text-white px-4 rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
