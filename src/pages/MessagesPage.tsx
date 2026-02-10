import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, MessageCircle, MoreVertical, Phone, Video, Smile, Paperclip, Check, CheckCheck } from "lucide-react";

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
  const newConversationWith = location.state?.newConversationWith;

  /* =========================
     STATE
     ========================= */
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isComposingNew, setIsComposingNew] = useState(false);
  const [newChatUser, setNewChatUser] = useState<any | null>(null);

  /* =========================
     HANDLE NEW CONVERSATION
     ========================= */
  useEffect(() => {
    if (newConversationWith) {
      setIsComposingNew(true);
      setNewChatUser(newConversationWith);
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [newConversationWith]);

  /* =========================
     AUTO OPEN PRESELECTED
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

        const enriched = (convRes.data.conversations || []).map((conv: any) => ({
          ...conv,
          unreadCount: unreadMap.get(conv._id) || 0,
        }));

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
      if (selectedConversation?._id === conversationId && fromUserId !== myUserId) {
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

      if (isComposingNew) {
        setIsComposingNew(false);
        const convRes = await getConversations();
        const conversations = convRes.data.conversations || [];
        setConversations(conversations);

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

  const isUserOnline = selectedUser && onlineUsers.has(selectedUser._id || selectedUser.userId);

  const showChat = selectedConversation || isComposingNew;

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 86400000) { // Less than 24 hours
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diff < 604800000) { // Less than 7 days
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  /* =========================
     JSX
     ========================= */
  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="h-full max-w-[1600px] mx-auto flex">
        {/* SIDEBAR - Conversations List */}
       <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Chats</h1>
              <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-4.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4"
                >
                  <MessageCircle className="w-16 h-16 text-purple-300" />
                </motion.div>
                <p className="text-gray-500 font-medium">No conversations yet</p>
                <p className="text-gray-400 text-sm mt-2">Start messaging to see your chats here</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredConversations.map((conv, index) => {
                  const otherUser = conv.participants.find((p: any) => {
                    const pId = typeof p === "string" ? p : p._id;
                    return pId !== myUserId;
                  });

                  if (!otherUser) return null;

                  const isActive = selectedConversation?._id === conv._id;
                  const isOnline = onlineUsers.has(otherUser._id);

                  return (
                    <motion.button
                      key={conv._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                        isActive ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={otherUser.avatar || '/default-avatar.png'}
                          alt={otherUser.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {otherUser.name || otherUser.username}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage?.text || 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="flex-shrink-0 ml-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="w-full md:w-2/3 flex flex-col bg-[#efeae2] dark:bg-gray-900">
          {!showChat ? (
            <div className="h-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-6 inline-block"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-16 h-16 text-purple-500" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  LinkUp Messages
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation to start messaging
                </p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedUser?.avatar || '/default-avatar.png'}
                      alt={selectedUser?.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {isUserOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedUser?.name || selectedUser?.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isComposingNew
                        ? `@${selectedUser?.username}`
                        : isUserOnline
                          ? 'Online'
                          : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </motion.button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_686b98c9fdffef3f63127759e2057750.png')] dark:bg-gray-900"
                onScroll={(e) => {
                  if ((e.target as HTMLDivElement).scrollTop === 0 && !isComposingNew) {
                    loadMoreMessages();
                  }
                }}
              >
                {isComposingNew && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-10 h-10 text-purple-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        Start a conversation with {selectedUser?.name}
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Send your first message below
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((m, index) => {
                      const senderId = typeof m.sender === "string" ? m.sender : m.sender?._id || m.sender?.id;
                      const isSent = senderId === myUserId;
                      const showTime = index === 0 || messages[index - 1].sender !== m.sender;

                      return (
                        <motion.div
                          key={m._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isSent
                                ? "bg-[#d9fdd3] dark:bg-green-900/30"
                                : "bg-white dark:bg-gray-800"
                            } rounded-lg shadow-sm`}
                          >
                            <div className="px-4 py-2">
                              <p className="text-sm text-gray-900 dark:text-gray-100 break-words">
                                {m.text}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {new Date(m.createdAt || Date.now()).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                                {isSent && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {m.seen ? (
                                      <CheckCheck size={14} className="text-blue-500" />
                                    ) : (
                                      <Check size={14} />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {typingUserId && !isComposingNew && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Smile size={24} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Paperclip size={24} />
                  </motion.button>
                  <input
                    value={messageText}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message"
                    className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Send size={20} />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}