import {
  createStockHistory,
  getAllStockHistory,
  getStockHistoryById,
  getHistoryByProduct,
  getHistoryByUser,
  deleteStockHistory,
  searchStockHistory,
} from "../../../backend/controllers/StockHistoryController.js";

import { verifyToken, adminOnly } from "../../../backend/middleware/auth.js";
import { dbConnect } from "../../../backend/utils/server.js";

export default async function handler(req, res) {
  await dbConnect();
  const { method, query, body } = req;
  const action = query.action;

  try {
    // POST /api/stock-history  (admin or system)
    if (method === "POST") {
      const {
        product,
        changedBy,
        previousQuantity,
        newQuantity,
        action: stockAction,
        note,
      } = body;

      if (
        !product ||
        !changedBy ||
        previousQuantity === undefined ||
        newQuantity === undefined ||
        !stockAction
      ) {
        return res.status(400).json({
          message:
            "Missing required fields: product, changedBy, previousQuantity, newQuantity, action",
        });
      }

      return verifyToken(req, res, () =>
        adminOnly(req, res, () =>
          createStockHistory(req, res, {
            product,
            changedBy,
            previousQuantity,
            newQuantity,
            action: stockAction,
            note: note || "",
          })
        )
      );
    }

    // GET /api/stock-history
    if (method === "GET") {
      if (action === "search") return searchStockHistory(req, res);
      if (action === "product" && query.id) return getHistoryByProduct(req, res);
      if (action === "user" && query.id) return getHistoryByUser(req, res);
      if (query.id) return getStockHistoryById(req, res);
      return getAllStockHistory(req, res);
    }

    // DELETE /api/stock-history?id=123  (admin only)
    if (method === "DELETE") {
      if (!query.id) return res.status(400).json({ message: "Missing history ID" });
      return verifyToken(req, res, () =>
        adminOnly(req, res, () => deleteStockHistory(req, res))
      );
    }

    // Method not allowed
    res.setHeader("Allow", ["POST", "GET", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error("Stock History API Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
