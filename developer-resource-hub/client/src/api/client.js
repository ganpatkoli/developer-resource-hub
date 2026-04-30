import axios from "axios";

const FALLBACK_API_URL = "http://localhost:5000/api";
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : FALLBACK_API_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

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

/** @deprecated use getAdminToken */
export const getToken = getAdminToken;
/** @deprecated use setAdminToken */
export const setToken = setAdminToken;

client.interceptors.request.use((config) => {
  if (config.authType === "admin" && getAdminToken()) {
    config.headers.Authorization = `Bearer ${getAdminToken()}`;
  } else if (config.authType === "user" && getUserToken()) {
    config.headers.Authorization = `Bearer ${getUserToken()}`;
  }
  return config;
});

function isAuthLoginUrl(url) {
  if (!url) return false;
  return /auth\/login$/.test(url) || /auth\/user\/login$/.test(url);
}

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || "";
      if (isAuthLoginUrl(url)) {
        return Promise.reject(err);
      }
      if (err.config?.authType === "admin" && getAdminToken()) {
        setAdminToken(null);
        if (
          window.location.pathname.startsWith("/admin") &&
          !window.location.pathname.includes("login")
        ) {
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
