import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deactivateCategory,
  searchCategories,
  getCategoriesWithProductCount,
} from "../../../backend/controllers/CategoryController";

import { verifyToken, adminOnly } from "../../../backend/middleware/auth";
import { dbConnect } from "../../../backend/utils/server";

export default async function handler(req, res) {
  await dbConnect();

  const { method, query } = req;
  const { action, id } = query;

  try {
    /* =========================
       CREATE CATEGORY (ADMIN)
    ========================== */
    if (method === "POST") {
      await verifyToken(req, res, () => {});
      await adminOnly(req, res, () => {});
      return createCategory(req, res);
    }

    /* =========================
       READ
    ========================== */
    if (method === "GET") {
      // Public search
      if (action === "search" && query.q) {
        return searchCategories(req, res);
      }

      // Admin-only: categories + product count
      if (action === "with-product-count") {
        await verifyToken(req, res, () => {});
        await adminOnly(req, res, () => {});
        return getCategoriesWithProductCount(req, res);
      }

      // Public: single category
      if (id) {
        return getCategoryById(req, res);
      }

      // Public: all categories
      return getAllCategories(req, res);
    }

    /* =========================
       UPDATE CATEGORY (ADMIN)
    ========================== */
    if (method === "PUT") {
      if (!id) {
        return res.status(400).json({ message: "Missing category ID" });
      }

      await verifyToken(req, res, () => {});
      await adminOnly(req, res, () => {});
      return updateCategory(req, res);
    }

    /* =========================
       DELETE CATEGORY (ADMIN)
    ========================== */
    if (method === "DELETE") {
      if (!id) {
        return res.status(400).json({ message: "Missing category ID" });
      }

      await verifyToken(req, res, () => {});
      await adminOnly(req, res, () => {});
      return deactivateCategory(req, res);
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
