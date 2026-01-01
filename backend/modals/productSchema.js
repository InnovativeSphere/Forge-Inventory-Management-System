import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: false,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    barcode: {
      type: String,
      unique: true,
      sparse: true, // allows null but enforces unique if provided
      trim: true,
    },

    images: {
      type: [String], // array of image URLs
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
