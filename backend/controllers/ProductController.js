import Product from "../modals/productSchema.js";
import StockHistory from "../modals/stockHistorySchema.js";

/**
 * CREATE PRODUCT (ADMIN ONLY)
 * Creates product + initial stock history
 */
export const createProduct = async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const {
      name,
      sku,
      category,
      supplier,
      quantity,
      minimumStock,
      costPrice,
      sellingPrice,
      description,
      barcode,
      images,
    } = req.body;

    if (
      !name ||
      !sku ||
      quantity == null ||
      costPrice == null ||
      sellingPrice == null
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      sku,
      category: category || null,
      supplier: supplier || null,
      quantity,
      minimumStock: minimumStock || 0,
      costPrice,
      sellingPrice,
      description: description || "",
      barcode: barcode || "",
      images: Array.isArray(images) ? images : [],
      isActive: true,
    });

    // Initial stock history
    if (quantity > 0) {
      await StockHistory.create({
        product: product._id,
        previousQuantity: 0,
        newQuantity: quantity,
        action: "restock",
        changedBy: req.user.id,
        note: "Initial stock on product creation",
      });
    }

    return res
      .status(201)
      .json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * UPDATE PRODUCT (ADMIN ONLY)
 * Handles quantity changes + stock history
 */
export const updateProduct = async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const update = { ...req.body };

    if (update.category === undefined) update.category = null;
    if (update.supplier === undefined) update.supplier = null;

    if (update.images && !Array.isArray(update.images)) {
      update.images = update.images.split(",").map((i) => i.trim());
    }

    const oldProduct = await Product.findById(req.query.id);
    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.query.id,
      update,
      { new: true, runValidators: true }
    );

    // Stock history only if quantity changed
    if (
      update.quantity !== undefined &&
      update.quantity !== oldProduct.quantity
    ) {
      await StockHistory.create({
        product: updatedProduct._id,
        previousQuantity: oldProduct.quantity,
        newQuantity: update.quantity,
        action:
          update.quantity > oldProduct.quantity ? "restock" : "sale",
        changedBy: req.user.id,
        note: "Quantity updated via updateProduct",
      });
    }

    return res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * SOFT DELETE PRODUCT (ADMIN ONLY)
 */
export const deleteProduct = async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.query.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      message: "Product deactivated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL PRODUCTS (PUBLIC)
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET PRODUCT BY ID (PUBLIC)
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET LOW STOCK PRODUCTS (ADMIN ONLY)
 */
export const getLowStockProducts = async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ["$quantity", "$minimumStock"] },
    });

    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
