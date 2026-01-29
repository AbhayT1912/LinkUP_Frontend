import { useState } from "react";
import { Send, Smile, Image as ImageIcon, Search } from "lucide-react";
import { conversations, users, messages as messagesData } from "../data/dummyData";

export function MessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("2");
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const currentMessages = messagesData[selectedUserId] || [];

  const filteredConversations = conversations.filter((conv) => {
    const user = users.find((u) => u.id === conv.userId);
    return user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSend = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] max-w-7xl mx-auto px-4 py-6">
      <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
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
              const user = users.find((u) => u.id === conv.userId);
              if (!user) return null;

              return (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedUserId(conv.userId)}
                  className={`w-full flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-purple-50 transition-colors ${
                    selectedUserId === conv.userId ? "bg-purple-50" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {conv.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        {user.verified && (
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{conv.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    {user.status && (
                      <p className="text-xs text-purple-600 mt-1 truncate">{user.status}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        {selectedUser ? (
          <div className={`flex-1 flex flex-col ${selectedUserId ? 'flex' : 'hidden md:flex'}`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <button
                onClick={() => setSelectedUserId("")}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                  {selectedUser.verified && (
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-500">{selectedUser.username}</p>
                {selectedUser.status && (
                  <p className="text-xs text-purple-600">{selectedUser.status}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {currentMessages.map((message) => {
                const isSent = message.senderId === "1";
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md ${
                        isSent
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      } rounded-2xl px-4 py-3 shadow-sm`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Message attachment"
                          className="rounded-lg mb-2 max-w-full"
                        />
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isSent ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
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
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
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
