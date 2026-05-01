// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// ── Axios instance ─────────────────────────────────────
export const api = axios.create({
  baseURL: "https://catering-backend-qffz.onrender.com",
  // baseURL: "http://localhost:5000",
  // baseURL: [
  //   "http://localhost:5000",
  //   "https://catering-backend-qffz.onrender.com",
  // ],
});

// Auto-attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Provider ───────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchMe()
        .then((u) => setUser(u))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Fetch current user → returns data.data ─────────────
  async function fetchMe() {
    const { data } = await api.get("/api/v1/auth/me");
    return data.data; // { _id, username, email, user_type, ... }
  }

  // ── Login ──────────────────────────────────────────────
  async function login(email, password) {
    try {
      const { data } = await api.post("/api/v1/auth/signin", {
        email,
        password,
      });
      // data = { success, message, token }
      localStorage.setItem("token", data.token);

      const profile = await fetchMe();
      setUser(profile);
      return { ...profile, message: data.message };
    } catch (err) {
      // surface backend message cleanly
      throw new Error(err.response?.data?.message || err.response?.data?.error);
    }
  }

  async function signup({ username, email, mobile_no, password }) {
    try {
      const { data } = await api.post("/api/v1/auth/signup", {
        username,
        email,
        mobile_no,
        password,
      });

      // If your backend returns token after signup → store it
      if (data.token) {
        localStorage.setItem("token", data.token);

        const profile = await fetchMe();
        setUser(profile);
        return { ...profile, message: data.message };
      }

      // If no token → just return response
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? "Signup failed");
    }
  }

  // ── Logout ─────────────────────────────────────────────
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  function getToken() {
    return localStorage.getItem("token");
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, getToken, api, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
