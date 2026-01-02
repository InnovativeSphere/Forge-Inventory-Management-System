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

export default function CreateProductModal({ onClose }: CreateProductModalProps) {
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
        onClose();
      } else {
        setError((result.payload as string) || "Failed to create product");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="
          bg-[var(--color-card)]
          w-full max-w-xl
          max-h-[90vh]
          rounded-2xl
          shadow-2xl
          animate-scale-in
          relative
          flex flex-col
        "
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold hover:text-red-500 transition"
        >
          ×
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-3 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
            Create New Product
          </h2>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {/* Scrollable Form */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              name="name"
              placeholder="Product Name (e.g., Wireless Mouse)"
              value={formData.name}
              onChange={handleChange}
              className="input"
            />

            <div className="flex gap-2">
              <input
                name="sku"
                placeholder="SKU"
                value={formData.sku}
                onChange={handleChange}
                className="input flex-1"
              />
              <Button variant="secondary" onClick={generateSKU} className="px-3">
                🔄
              </Button>
            </div>

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

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input"
              />
              <input
                type="number"
                name="minimumStock"
                placeholder="Min Stock Alert"
                value={formData.minimumStock}
                onChange={handleChange}
                className="input"
              />
              <input
                type="number"
                name="costPrice"
                placeholder="Cost Price (₦)"
                value={formData.costPrice}
                onChange={handleChange}
                className="input"
              />
              <input
                type="number"
                name="sellingPrice"
                placeholder="Selling Price (₦)"
                value={formData.sellingPrice}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="flex gap-2 md:col-span-2">
              <input
                name="barcode"
                placeholder="Barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="input flex-1"
              />
              <Button variant="secondary" onClick={generateBarcode} className="px-3">
                🔄
              </Button>
            </div>

            <input
              name="images"
              placeholder="Image URLs (comma separated)"
              value={formData.images}
              onChange={handleChange}
              className="input md:col-span-2"
            />

            <textarea
              name="description"
              placeholder="Description / notes about this product"
              value={formData.description}
              onChange={handleChange}
              className="input md:col-span-2 min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
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
