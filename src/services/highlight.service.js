import api from "./api";

/**
 * Create a new highlight
 * @param {{ title: string }} data
 */
export const createHighlight = (data) =>
  api.post("/highlights", data);

/**
 * Add a story to an existing highlight
 * @param {string} highlightId
 * @param {string} storyId
 */
export const addStoryToHighlight = (highlightId, storyId) =>
  api.post(`/highlights/${highlightId}/stories/${storyId}`);

/**
 * Get highlights of a user
 * @param {string} userId
 */
export const getUserHighlights = (userId) =>
  api.get(`/highlights/user/${userId}`);
