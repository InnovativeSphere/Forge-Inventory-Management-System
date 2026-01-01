// models/Sale.ts
import { Schema, model, models, Types } from "mongoose";

const SaleSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    customerName: {
      type: String,
      default: null,
    },
    customerContact: {
      type: String,
      default: null,
    },
    soldBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer", "other"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["completed", "cancelled", "refunded"],
      default: "completed",
    },
    reference: {
      type: String,
      unique: true,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default models.Sale || model("Sale", SaleSchema);
