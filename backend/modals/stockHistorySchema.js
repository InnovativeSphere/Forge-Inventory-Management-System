import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const StockHistorySchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    action: {
      type: String,
      enum: ["sale", "restock", "adjustment", "reversal"],
      required: true,
    },
    changedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Ensure model is only registered once
export default mongoose.models.StockHistory || model("StockHistory", StockHistorySchema);
