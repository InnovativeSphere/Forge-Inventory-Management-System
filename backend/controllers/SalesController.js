import mongoose from "mongoose";
import Sale from "../modals/saleSchema.js";
import Product from "../modals/productSchema.js";
import StockHistory from "../modals/stockHistorySchema.js";

// --- Helpers ---
const logStockChange = async ({
  productId,
  userId,
  action,
  previousQuantity,
  newQuantity,
  note,
  session,
}) => {
  try {
    await StockHistory.create(
      [
        {
          product: productId,
          changedBy: userId,
          action,
          previousQuantity,
          newQuantity,
          note,
        },
      ],
      { session }
    );
    console.log(
      `Stock change logged: ${action} | product: ${productId} | prev: ${previousQuantity} | new: ${newQuantity} | by user: ${userId}`
    );
  } catch (err) {
    console.error("logStockChange error:", err);
    throw err;
  }
};

// 1. Create Sale
export const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user?.id) throw new Error("Authenticated user not found");
    const soldBy = req.user.id;

    const {
      product,
      quantity,
      paymentMethod,
      customerName,
      customerContact,
      discount = 0,
      notes,
    } = req.body;

    if (!mongoose.isValidObjectId(product)) throw new Error("Invalid Product ID");
    if (!quantity || quantity < 1) throw new Error("Invalid quantity");

    const productDoc = await Product.findById(product).session(session);
    if (!productDoc) throw new Error("Product not found");
    if (productDoc.quantity < quantity) throw new Error("Insufficient stock");

    const previousQuantity = productDoc.quantity;
    productDoc.quantity -= quantity;
    await productDoc.save({ session });

    const unitPrice = productDoc.sellingPrice;
    const totalPrice = unitPrice * quantity - discount;

    const sale = await Sale.create(
      [
        {
          product,
          quantity,
          unitPrice,
          discount,
          totalPrice,
          soldBy, // auto-assigned
          paymentMethod,
          customerName,
          customerContact,
          notes,
          reference: `SALE-${Date.now()}`,
          status: "completed",
        },
      ],
      { session }
    );

    await logStockChange({
      productId: product,
      userId: soldBy,
      action: "sale",
      previousQuantity,
      newQuantity: productDoc.quantity,
      note: "Sale completed",
      session,
    });

    await session.commitTransaction();
    res.status(201).json(sale[0]);
  } catch (error) {
    await session.abortTransaction();
    console.error("createSale error:", error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// 2. Get All Sales
export const getAllSales = async (req, res) => {
  try {
    const { from, to, product, soldBy, paymentMethod, status } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (product) filter.product = product;
    if (soldBy) filter.soldBy = soldBy;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status) filter.status = status;

    const sales = await Sale.find(filter)
      .populate("product")
      .populate("soldBy")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    console.error("getAllSales error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Single Sale
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.query.id)
      .populate("product")
      .populate("soldBy");

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    res.json(sale);
  } catch (error) {
    console.error("getSaleById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Sale (Quantity Only)
export const updateSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user?.id) throw new Error("Authenticated user not found");
    const userId = req.user.id;

    const sale = await Sale.findById(req.query.id).session(session);
    if (!sale) throw new Error("Sale not found");
    if (sale.status !== "completed")
      throw new Error("Only completed sales can be updated");

    const newQty = req.body.quantity ?? sale.quantity;
    const diff = newQty - sale.quantity;

    if (diff !== 0) {
      const productDoc = await Product.findById(sale.product).session(session);
      if (!productDoc) throw new Error("Product not found");
      if (diff > 0 && productDoc.quantity < diff)
        throw new Error("Insufficient stock");

      const previousQuantity = productDoc.quantity;
      productDoc.quantity -= diff;
      await productDoc.save({ session });

      await logStockChange({
        productId: sale.product,
        userId,
        action: "adjustment",
        previousQuantity,
        newQuantity: productDoc.quantity,
        note: "Sale quantity updated",
        session,
      });

      sale.quantity = newQty;
      sale.totalPrice = sale.unitPrice * newQty - sale.discount;
    }

    await sale.save({ session });
    await session.commitTransaction();
    res.json(sale);
  } catch (error) {
    await session.abortTransaction();
    console.error("updateSale error:", error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// 5. Delete (Cancel) Sale
export const deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user?.id) throw new Error("Authenticated user not found");
    const userId = req.user.id;

    const sale = await Sale.findById(req.query.id).session(session);
    if (!sale) throw new Error("Sale not found");
    if (sale.status !== "completed")
      throw new Error("Sale already cancelled or refunded");

    const productDoc = await Product.findById(sale.product).session(session);
    if (!productDoc) throw new Error("Product not found");

    const previousQuantity = productDoc.quantity;
    productDoc.quantity += sale.quantity;
    await productDoc.save({ session });

    sale.status = "cancelled";
    await sale.save({ session });

    await logStockChange({
      productId: sale.product,
      userId,
      action: "reversal",
      previousQuantity,
      newQuantity: productDoc.quantity,
      note: "Sale cancelled",
      session,
    });

    await session.commitTransaction();
    res.json({ message: "Sale cancelled successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("deleteSale error:", error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// 6. Sales Stats (Completed Only)
export const getSalesStats = async (req, res) => {
  try {
    const match = { status: "completed" };

    const daily = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const paymentBreakdown = await Sale.aggregate([
      { $match: match },
      { $group: { _id: "$paymentMethod", total: { $sum: "$totalPrice" } } },
    ]);

    res.json({ daily, paymentBreakdown });
  } catch (error) {
    console.error("getSalesStats error:", error);
    res.status(500).json({ message: error.message });
  }
};
