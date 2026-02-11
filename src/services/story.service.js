// story.service.js
import axios from "axios";

// CRITICAL: Make sure this matches your backend URL
const API_URL =  import.meta.env.VITE_API_BASE_URL;

console.log("API_URL configured as:", API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   CREATE STORY
   ========================= */
export const addStory = async (formData) => {
  try {
    console.log("Creating story with FormData...");

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/api/stories`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    console.log("Story created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating story:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

/* =========================
   GET FEED STORIES ✅ FIXED
   ========================= */
export const getFeedStories = async () => {
  try {
    console.log("Fetching stories from:", `${API_URL}/api/stories/feed`);

    const response = await api.get("/api/stories/feed");

    console.log("Stories response:", response.data);

    // 🔥 IMPORTANT FIX
    // Backend returns { success, stories }
    // Frontend expects stories array directly
    return response.data.stories;
  } catch (error) {
    console.error("Error fetching stories:", error);

    if (
      error.response?.data &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      throw new Error("Backend server error — check backend logs");
    }

    if (!error.response) {
      throw new Error("Cannot connect to server");
    }

    throw error;
  }
};

/* =========================
   VIEW STORY
   ========================= */
export const viewStory = async (storyId) => {
  try {
    const response = await api.post(`/api/stories/${storyId}/view`);
    return response.data;
  } catch (error) {
    console.error("Error viewing story:", error);
    throw error;
  }
};
