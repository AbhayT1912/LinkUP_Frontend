import api from "./api";

export const getFeedPosts = (page = 1, limit = 10) =>
  api.get(`/posts/feed?page=${page}&limit=${limit}`);

export const createPost = (formData) =>
  api.post("/posts", formData);

export const likePost = (postId) =>
  api.post(`/posts/${postId}/like`);

export const getPostsByUser = (userId) =>
  api.get(`/posts/user/${userId}`);

export const addComment = (postId, text) =>
  api.post(`/posts/${postId}/comments`, { text });

export const getPostComments = (postId, page = 1) =>
  api.get(`/posts/${postId}/comments?page=${page}`);

export const deleteComment = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);
