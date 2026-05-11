import axios from "axios";

export const ADMIN_TOKEN_KEY = "dhub_token";
export const USER_TOKEN_KEY = "dhub_user_token";
const USER_INFO_KEY = "dhub_user_info";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setUserToken(token) {
  if (token) localStorage.setItem(USER_TOKEN_KEY, token);
  else {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  }
}

export function getUserInfo() {
  try {
    const s = localStorage.getItem(USER_INFO_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function setUserInfo(info) {
  if (info) localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
  else localStorage.removeItem(USER_INFO_KEY);
}

// API URL is now purely derived from .env
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
});

// Request interceptor to automatically attach the correct Authorization token
client.interceptors.request.use((config) => {
  const adminToken = getAdminToken();
  const userToken = getUserToken();
  const token = adminToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle session expiration and automatic redirects
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Clear token and redirect if unauthorized
      if (err.config?.authType === "admin" && getAdminToken()) {
        setAdminToken(null);
        if (window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("login")) {
          window.location.replace("/admin/login");
        }
      } else if (err.config?.authType === "user" && getUserToken()) {
        setUserToken(null);
        if (window.location.pathname.startsWith("/user/")) {
          window.location.replace("/user/login");
        }
      }
    }
    return Promise.reject(err);
  }
);

export default client;
