import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesStats,
} from "../../../backend/controllers/SalesController.js";

import { verifyToken, adminOnly } from "../../../backend/middleware/auth.js";
import { dbConnect } from "../../../backend/utils/server.js";

export default async function handler(req, res) {
  await dbConnect();

  const { method, query } = req;
  const action = query.action;

  try {
    if (method === "OPTIONS") {
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      return res.status(200).end();
    }

    // -----------------
    // CREATE SALE
    // -----------------
    if (method === "POST") {
      await verifyToken(req, res);
      if (res.writableEnded) return;
      return createSale(req, res);
    }

    // -----------------
    // GET SALES / STATS
    // -----------------
    if (method === "GET") {
      if (query.id && !query.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid sale ID format" });
      }

      if (action === "stats") {
        await verifyToken(req, res);
        if (res.writableEnded) return;
        await adminOnly(req, res);
        if (res.writableEnded) return;
        return getSalesStats(req, res);
      }

      if (query.id) return getSaleById(req, res);

      return getAllSales(req, res);
    }

    // -----------------
    // UPDATE SALE
    // -----------------
    if (method === "PUT") {
      if (!query.id)
        return res.status(400).json({ message: "Missing sale ID" });

      await verifyToken(req, res);
      if (res.writableEnded) return;
      await adminOnly(req, res);
      if (res.writableEnded) return;
      return updateSale(req, res);
    }

    // -----------------
    // DELETE SALE
    // -----------------
    if (method === "DELETE") {
      if (!query.id)
        return res.status(400).json({ message: "Missing sale ID" });

      await verifyToken(req, res);
      if (res.writableEnded) return;
      await adminOnly(req, res);
      if (res.writableEnded) return;
      return deleteSale(req, res);
    }

    // -----------------
    // METHOD NOT ALLOWED
    // -----------------
    res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}
