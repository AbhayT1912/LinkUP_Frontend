import api from "./api";

export const sendMessage = (data) =>
  api.post("/messages", data);

export const getConversations = () =>
  api.get("/messages/conversations");

export const getMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);

export const markMessagesAsRead = (conversationId) =>
  api.put(`/messages/${conversationId}/read`);

export const getUnreadTotal = () =>
  api.get("/messages/unread/total");

export const getUnreadCounts = () =>
  api.get("/messages/unread");

export const unsendMessage = (messageId) =>
  api.delete(`/messages/unsend/${messageId}`);
