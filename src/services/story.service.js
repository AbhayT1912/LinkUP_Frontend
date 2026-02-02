import api from "./api";

export const addStory = (formData) =>
  api.post("/stories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getFeedStories = () =>
  api.get("/stories/feed");

export const viewStory = (storyId) =>
  api.post(`/stories/${storyId}/view`);
