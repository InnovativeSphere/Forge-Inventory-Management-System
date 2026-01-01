import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserTheme,
  toggleUserTheme,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
} from "../../../backend/controllers/UserController";

import { dbConnect } from "../../../backend/utils/server.js";
import { verifyToken, adminOnly } from "../../../backend/middleware/auth.js";

export default async function handler(req, res) {
  await dbConnect();

  const { method, query } = req;
  const { action, id } = query;

  /* =========================
     PUBLIC ROUTES
  ========================== */
  if (method === "POST") {
    if (action === "register") return registerUser(req, res);
    if (action === "login") return loginUser(req, res);
  }

  /* =========================
     AUTHENTICATED ROUTES
  ========================== */
  const verified = await verifyToken(req, res);
  if (!verified) return;

  /* -------- USER SELF -------- */
  if (!id) {
    if (method === "GET") {
      if (action === "profile" || !action) return getUserProfile(req, res);
    }

    if (method === "PUT") {
      if (action === "theme") return updateUserTheme(req, res);
      if (action === "toggle-theme") return toggleUserTheme(req, res);
      return updateUserProfile(req, res);
    }
  }

  /* -------- ADMIN ROUTES -------- */
  if (id || action === "allUsers") {
    const isAdmin = await adminOnly(req, res);
    if (!isAdmin) return;

    if (method === "GET") {
      if (action === "allUsers" || (!action && !id)) return getAllUsers(req, res);
      if (id) return getUserById(req, res);
    }

    if (method === "PUT" && id) return updateUserByAdmin(req, res);
    if (method === "DELETE" && id) return deleteUser(req, res);

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
