import mongoose from "mongoose";
import StockHistory from "../modals/stockHistorySchema.js";
import Product from "../modals/productSchema.js";
import User from "../modals/userSchema.js";

// --- Helpers ---
const createHistoryEntry = async ({
  product,
  changedBy,
  previousQuantity,
  newQuantity,
  action,
  note,
  session, // <- added session
}) => {
  return await StockHistory.create(
    [
      {
        product,
        changedBy: changedBy || null,
        previousQuantity: Number(previousQuantity || 0),
        newQuantity: Number(newQuantity || 0),
        action,
        note: note || "",
      },
    ],
    { session }
  );
};

// 1. Create Stock History Entry (transactional)
export const createStockHistory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      product,
      productId, // fallback for product field
      changedBy,
      previousQuantity,
      newQuantity,
      action,
      note,
    } = req.body;

    const finalProduct = product || productId;

    if (
      !finalProduct ||
      previousQuantity === undefined ||
      newQuantity === undefined ||
      !action
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Missing required fields",
        received: {
          product: finalProduct,
          changedBy,
          previousQuantity,
          newQuantity,
          action,
        },
      });
    }

    // 1️⃣ Create history entry
    const history = await createHistoryEntry({
      product: finalProduct,
      changedBy,
      previousQuantity,
      newQuantity,
      action,
      note,
      session,
    });

    // 2️⃣ Re-fetch and populate properly
    const populatedHistory = await history.constructor
      .findById(history._id)
      .populate("product")
      .populate("changedBy")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(populatedHistory);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("StockHistory Create Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 2. Get All Stock History
export const getAllStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find()
      .populate("product")
      .populate("changedBy")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Stock History By ID
export const getStockHistoryById = async (req, res) => {
  try {
    const history = await StockHistory.findById(req.query.id)
      .populate("product")
      .populate("changedBy");

    if (!history)
      return res.status(404).json({ message: "History entry not found" });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get History By Product
export const getHistoryByProduct = async (req, res) => {
  try {
    const history = await StockHistory.find({ product: req.query.id })
      .populate("changedBy")
      .sort({ createdAt: -1 });

    res.json({
      productId: req.query.id,
      total: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Get History By User
export const getHistoryByUser = async (req, res) => {
  try {
    const history = await StockHistory.find({ changedBy: req.query.id })
      .populate("product")
      .sort({ createdAt: -1 });

    res.json({
      userId: req.query.id,
      total: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Delete History Entry
export const deleteStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.findByIdAndDelete(req.query.id);

    if (!history)
      return res.status(404).json({ message: "History entry not found" });

    res.json({ message: "History entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Search Stock History
export const searchStockHistory = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query missing" });

    const keyword = new RegExp(q, "i");

    const history = await StockHistory.find({ note: keyword })
      .populate("product")
      .populate("changedBy")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
