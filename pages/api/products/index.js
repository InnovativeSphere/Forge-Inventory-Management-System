import { dbConnect } from "../../../backend/utils/server.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from "../../../backend/controllers/ProductController.js";
import { verifyToken, adminOnly } from "../../../backend/middleware/auth.js";

export default async function handler(req, res) {
  await dbConnect();

  const { method, query } = req;
  const { action, id } = query;

  try {
    /* =========================
       CREATE PRODUCT (ADMIN)
    ========================== */
    if (method === "POST") {
      const verified = await verifyToken(req, res);
      if (!verified) return;
      const isAdmin = await adminOnly(req, res);
      if (!isAdmin) return;

      return createProduct(req, res);
    }

    /* =========================
       READ PRODUCTS (PUBLIC)
    ========================== */
    if (method === "GET") {
      // Low stock (admin only)
      if (action === "low-stock") {
        const verified = await verifyToken(req, res);
        if (!verified) return;
        const isAdmin = await adminOnly(req, res);
        if (!isAdmin) return;

        return getLowStockProducts(req, res);
      }

      // Single product
      if (id) {
        return getProductById(req, res);
      }

      // All products
      return getAllProducts(req, res);
    }

    /* =========================
       UPDATE PRODUCT (ADMIN)
    ========================== */
    if (method === "PUT") {
      if (!id) {
        return res.status(400).json({ message: "Missing product ID" });
      }

      const verified = await verifyToken(req, res);
      if (!verified) return;
      const isAdmin = await adminOnly(req, res);
      if (!isAdmin) return;

      return updateProduct(req, res);
    }

    /* =========================
       DELETE PRODUCT (ADMIN)
    ========================== */
    if (method === "DELETE") {
      if (!id) {
        return res.status(400).json({ message: "Missing product ID" });
      }

      const verified = await verifyToken(req, res);
      if (!verified) return;
      const isAdmin = await adminOnly(req, res);
      if (!isAdmin) return;

      return deleteProduct(req, res);
    }

    res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error("Product Route Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
