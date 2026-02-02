import api from "./api";

export const register = (data) =>
  api.post("/auth/register", data);

export const login = (data) =>
  api.post("/auth/login", data);

export const logout = () => {
  localStorage.removeItem("token");
};

export const checkUsername = (username) =>
  api.get(`/auth/check-username/${username}`);
