import Supplier from "../modals/supplierSchema.js";
import Product from "../modals/productSchema.js";

// 1. Create Supplier (ADMIN)
export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Get All Suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Supplier By ID
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.query.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Supplier (ADMIN)
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.query.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 5. Delete Supplier (ADMIN)
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.query.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Get Products By Supplier
export const getProductsBySupplier = async (req, res) => {
  try {
    const products = await Product.find({ supplier: req.query.id });
    res.json({ supplierId: req.query.id, total: products.length, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Search Suppliers
export const searchSuppliers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query missing" });

    const keyword = new RegExp(q, "i");
    const suppliers = await Supplier.find({
      $or: [{ name: keyword }, { company: keyword }, { email: keyword }, { phone: keyword }, { address: keyword }],
    });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Supplier Product Count
export const getSupplierProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments({ supplier: req.query.id });
    res.json({ supplierId: req.query.id, productCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
