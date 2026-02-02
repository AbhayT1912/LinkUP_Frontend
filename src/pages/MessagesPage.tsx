import { useEffect, useState } from "react";
import { Send, Smile, Image as ImageIcon, Search, MessageCircle } from "lucide-react";
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../services/message.service";
import { getUserIdFromToken } from "../utils/auth";

export function MessagesPage() {
  const myUserId = getUserIdFromToken();

  /* =========================
     STATE
     ========================= */
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* =========================
     LOAD CONVERSATIONS
     ========================= */
  useEffect(() => {
    const loadConversations = async () => {
      const res = await getMyConversations();
      setConversations(res.data.conversations);
    };
    loadConversations();
  }, []);

  /* =========================
     SELECT CONVERSATION
     ========================= */
  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversation(conversation);

    const res = await getMessages(conversation._id);
    setMessages(res.data.messages);

    await markMessagesAsRead(conversation._id);
  };

  /* =========================
     SEND MESSAGE
     ========================= */
  const handleSend = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.participants.find(
      (p: any) => p._id !== myUserId
    )?._id;

    if (!receiverId) return;

    const res = await sendMessage({
      receiverId,
      text: messageText,
    });

    setMessages((prev) => [...prev, res.data.message]);
    setMessageText("");
  };

  /* =========================
     DERIVED DATA (UI SAFE)
     ========================= */
  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p: any) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const selectedUser = selectedConversation
    ? selectedConversation.participants.find((p: any) => p._id !== myUserId)
    : null;

  /* =========================
     JSX (UNCHANGED)
     ========================= */
  return (
    <div className="h-[calc(100vh-2rem)] max-w-7xl mx-auto px-4 py-6">
      <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => {
              const user = conv.participants.find((p: any) => p._id !== myUserId);
              if (!user) return null;

              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-purple-50 transition-colors ${
                    selectedConversation?._id === conv._id ? "bg-purple-50" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">{user.username}</p>
                      <span className="text-xs text-gray-400">
                        {conv.lastMessage?.createdAt
                          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        {selectedUser ? (
          <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{selectedUser.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => {
                const isSent = message.sender === myUserId;
                return (
                  <div key={message._id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs md:max-w-md ${
                        isSent
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      } rounded-2xl px-4 py-3 shadow-sm`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-1 ${isSent ? "text-white/80" : "text-gray-500"}`}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className={`p-3 rounded-xl transition-all ${
                    messageText.trim()
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-purple-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</p>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
