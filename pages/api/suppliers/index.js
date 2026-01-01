import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getProductsBySupplier,
  searchSuppliers,
  getSupplierProductCount,
} from "../../../backend/controllers/SupplierController.js";

import { verifyToken, adminOnly } from "../../../backend/middleware/auth.js";
import { dbConnect } from "../../../backend/utils/server.js";

export default async function handler(req, res) {
  await dbConnect();

  const { method, query } = req;
  const { action, id } = query;

  try {
    /* =========================
       CREATE SUPPLIER (ADMIN)
    ========================== */
    if (method === "POST") {
      const ok = await verifyToken(req, res);
      if (!ok) return;

      const isAdmin = await adminOnly(req, res);
      if (!isAdmin) return;

      return createSupplier(req, res);
    }

    /* =========================
       READ SUPPLIERS
    ========================== */
    if (method === "GET") {
      // Search suppliers
      if (action === "search") {
        return searchSuppliers(req, res);
      }

      // Products by supplier
      if (action === "products" && id) {
        return getProductsBySupplier(req, res);
      }

      // Supplier product count
      if (action === "count" && id) {
        return getSupplierProductCount(req, res);
      }

      // Single supplier
      if (id) {
        return getSupplierById(req, res);
      }

      // All suppliers
      return getAllSuppliers(req, res);
    }

    /* =========================
       UPDATE SUPPLIER (ADMIN)
    ========================== */
    if (method === "PUT") {
      if (!id) {
        return res.status(400).json({ message: "Missing supplier ID" });
      }

      const ok = await verifyToken(req, res);
      if (!ok) return;

      const isAdmin = await adminOnly(req, res);
      if (!isAdmin) return;

      return updateSupplier(req, res);
    }

    /* =========================
       DELETE SUPPLIER (ADMIN)
    ========================== */
    if (method === "DELETE") {
      if (!id) {
        return res.status(400).json({ message: "Missing supplier ID" });
      }

      const ok = await verifyToken(req, res);
      if (!ok) return;

      const isAdmin = await adminOnly(req, res);
      if (!isAdmin) return;

      return deleteSupplier(req, res);
    }

    res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error("Supplier Route Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
