import axios from "axios";
import api from "./api";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

/* =========================
   PROFILE
   ========================= */

export const getMyProfile = () =>
  api.get("/users/me");

export const updateMyProfile = (data) =>
  api.put("/users/me", data);

/* =========================
   SEARCH & PUBLIC PROFILE
   ========================= */

export const searchUsers = (query) =>
  api.get(`/users/search?q=${query}`);

export const getUserByUsername = (username) =>
  api.get(`/users/${username}`);

/* =========================
   FOLLOW SYSTEM
   ========================= */

export const followUser = (userId) =>
  api.post(`/users/${userId}/follow`);

export const unfollowUser = (userId) =>
  api.post(`/users/${userId}/unfollow`);

export const getMyFollowers = () =>
  api.get("/users/me/followers");

export const getMyFollowing = () =>
  api.get("/users/me/following");

/* =========================
   MEDIA UPLOADS
   ========================= */

export const uploadAvatar = async (base64Image, userId) => {
  try {
    const response = await api.post("/users/upload-avatar", {
      avatar: base64Image,
      userId,
    });
    return response.data;
  } catch (err) {
    console.error("Avatar upload error:", err);
    throw {
      status: err.response?.status || 500,
      message: err.response?.data?.message || "Avatar upload failed",
    };
  }
};

export const uploadCoverImage = async (base64Image) => {
  try {
    const response = await api.post("/users/upload-cover", {
      coverImage: base64Image,
    });
    return response.data;
  } catch (err) {
    console.error("Cover image upload error:", err);
    throw {
      status: err.response?.status || 500,
      message: err.response?.data?.message || "Cover image upload failed",
    };
  }
};
