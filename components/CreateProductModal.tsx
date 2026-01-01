"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { createProduct } from "../redux/slices/productSlice";
import { fetchAllCategories } from "../redux/slices/categorySlice";
import { fetchAllSuppliers } from "../redux/slices/supplierSlice";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import "../app/global.css";

interface CreateProductModalProps {
  onClose: () => void;
}

export default function CreateProductModal({
  onClose,
}: CreateProductModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const suppliers = useSelector((state: RootState) => state.supplier.suppliers);

  useEffect(() => {
    dispatch(fetchAllCategories({}));
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    supplier: "",
    quantity: 0,
    minimumStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    description: "",
    barcode: "",
    images: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSKU = () => {
    if (!formData.name) return;
    const slug = formData.name
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-")
      .slice(0, 6);
    const randomNum = Math.floor(Math.random() * 900 + 100);
    setFormData((prev) => ({ ...prev, sku: `${slug}-${randomNum}` }));
  };

  const generateBarcode = () => {
    const randomCode = Math.floor(Math.random() * 900000000000 + 100000000000);
    setFormData((prev) => ({ ...prev, barcode: randomCode.toString() }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (
      ["quantity", "minimumStock", "costPrice", "sellingPrice"].includes(name)
    ) {
      const num = Number(value);
      setFormData((prev) => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category || null,
      supplier: formData.supplier || null,
      quantity: formData.quantity,
      minimumStock: formData.minimumStock,
      costPrice: formData.costPrice,
      sellingPrice: formData.sellingPrice,
      description: formData.description || "",
      barcode: formData.barcode || "",
      images: formData.images
        ? formData.images.split(",").map((img) => img.trim())
        : [],
      isActive: formData.isActive,
    };

    try {
      const result = await dispatch(createProduct({ payload }));
      if (createProduct.fulfilled.match(result)) {
        setLoading(false);
        onClose();
      } else {
        setLoading(false);
        setError((result.payload as string) || "Failed to create product");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Failed to create product");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-card)] w-full max-w-xl rounded-2xl p-8 shadow-2xl animate-scale-in relative space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold hover:text-red-500 transition"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-[var(--color-foreground)]">
          Create New Product
        </h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <input
            name="name"
            placeholder="Product Name (e.g., Wireless Mouse)"
            value={formData.name}
            onChange={handleChange}
            className="input"
          />

          {/* SKU */}
          <div className="flex gap-2">
            <input
              name="sku"
              placeholder="SKU (click 🔄 to generate or enter manually)"
              value={formData.sku}
              onChange={handleChange}
              className="input flex-1"
            />
            <Button
              variant="secondary"
              onClick={generateSKU}
              className="text-sm px-3 py-1"
            >
              🔄
            </Button>
          </div>

          {/* Category */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Supplier */}
          <select
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>

          {/* Quantity & Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            {/* Quantity */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                Quantity (units in stock)
              </label>
              <input
                name="quantity"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                type="number"
              />
            </div>

            {/* Minimum Stock */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                Minimum Stock Alert
              </label>
              <input
                name="minimumStock"
                placeholder="e.g., 5"
                value={formData.minimumStock}
                onChange={handleChange}
                className="input border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                type="number"
              />
            </div>

            {/* Cost Price */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                Cost Price (₦)
              </label>
              <input
                name="costPrice"
                placeholder="Enter cost price"
                value={formData.costPrice}
                onChange={handleChange}
                className="input border-green-400 focus:border-green-400 focus:ring-green-400"
                type="number"
              />
            </div>

            {/* Selling Price */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                Selling Price (₦)
              </label>
              <input
                name="sellingPrice"
                placeholder="Enter selling price"
                value={formData.sellingPrice}
                onChange={handleChange}
                className="input border-blue-400 focus:border-blue-400 focus:ring-blue-400"
                type="number"
              />
            </div>
          </div>

          {/* Barcode */}
          <div className="flex gap-2 md:col-span-2">
            <input
              name="barcode"
              placeholder="Barcode (click 🔄 to generate or enter manually)"
              value={formData.barcode}
              onChange={handleChange}
              className="input flex-1"
              type="text"
            />
            <Button
              variant="secondary"
              onClick={generateBarcode}
              className="text-sm px-3 py-1"
            >
              🔄
            </Button>
          </div>

          {/* Images */}
          <input
            name="images"
            placeholder="Image URLs (comma separated)"
            value={formData.images}
            onChange={handleChange}
            className="input md:col-span-2"
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Description / notes about this product"
            value={formData.description}
            onChange={handleChange}
            className="input md:col-span-2 min-h-[100px]"
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
            />
            Active Product
          </label>

          <Button onClick={handleSubmit} disabled={loading} variant="primary">
            {loading ? <Spinner /> : "Create Product"}
          </Button>
        </div>
      </div>
    </div>
  );
}
