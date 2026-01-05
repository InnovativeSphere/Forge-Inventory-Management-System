import axios from "axios";

/* =========================
   PAYLOAD TYPES
========================= */

export interface RegisterPayload {
  username: string;
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  profilePicture?: string;
  theme?: "light" | "dark";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserPayload {
  _id?: string; // MongoDB id
  id?: string; // optional frontend mapping
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  phone?: string;
  isActive?: boolean;
  profilePicture?: string;
  theme?: "light" | "dark";
}

/* =========================
   BASE URL
========================= */

const BASE_URL = "/api/users";

/* =========================
   API METHODS
========================= */

export const userApi = {
  /* -------- AUTH -------- */
  registerUser: (payload: RegisterPayload) =>
    axios.post(`${BASE_URL}?action=register`, payload),

  registerAdmin: (payload: RegisterPayload) =>
    axios.post(`${BASE_URL}?action=register`, {
      ...payload,
      role: "admin",
    }),

  loginUser: (payload: LoginPayload) =>
    axios.post(`${BASE_URL}?action=login`, payload),

  logoutUser: (token: string) =>
    axios.post(
      `${BASE_URL}?action=logout`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),

  /* -------- USER SELF -------- */
  fetchProfile: (token: string) =>
    axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` }, // FIXED: removed ?action=profile
    }),

  updateProfile: (payload: UserPayload, token: string) =>
    axios.put(BASE_URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateUserTheme: (payload: { theme: "light" | "dark" }, token: string) =>
    axios.put(`${BASE_URL}?action=theme`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  toggleUserTheme: (token: string) =>
    axios.put(
      `${BASE_URL}?action=toggle-theme`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),

  /* -------- ADMIN -------- */
  getAllUsers: (token: string) =>
    axios.get(`${BASE_URL}?action=allUsers`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getUserById: (id: string, token: string) =>
    axios.get(`${BASE_URL}?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateUserByAdmin: (id: string, payload: UserPayload, token: string) =>
    axios.put(`${BASE_URL}?id=${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteUser: (id: string, token: string) =>
    axios.delete(`${BASE_URL}?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
