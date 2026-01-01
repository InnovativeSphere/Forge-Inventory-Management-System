"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import {
  updateProduct,
  deleteProduct,
  Product,
} from "../redux/slices/productSlice";
import { fetchAllCategories } from "../redux/slices/categorySlice";
import { fetchAllSuppliers } from "../redux/slices/supplierSlice";
import "../app/global.css";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function EditProductModal({ product, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const suppliers = useSelector((state: RootState) => state.supplier.suppliers);

  const previousQuantityRef = useRef(product.quantity);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    category: product.category ?? "",
    supplier: product.supplier ?? "",
    quantity: product.quantity,
    minimumStock: product.minimumStock,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    description: product.description ?? "",
    barcode: product.barcode ?? "",
    images: product.images?.join(", ") ?? "",
    isActive: product.isActive ?? true,
  });

  useEffect(() => {
    dispatch(fetchAllCategories({}));
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || ["quantity", "minimumStock", "costPrice", "sellingPrice"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleUpdate = async () => {
    if (loading) return;

    setLoading(true);
    setMessage(null);

    const payload = {
      ...formData,
      category: formData.category || null,
      supplier: formData.supplier || null,
      images: formData.images
        ? formData.images.split(",").map((i) => i.trim())
        : [],
    };

    const result = await dispatch(updateProduct({ id: product.id, payload }));

    if (updateProduct.fulfilled.match(result)) {
      const updatedProduct = result.payload.product;
      previousQuantityRef.current = updatedProduct.quantity;

      setMessage("Product updated successfully.");
      setTimeout(onClose, 1200);
    } else {
      setMessage((result.payload as string) || "Update failed.");
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;

    setLoading(true);
    const result = await dispatch(deleteProduct({ id: product.id }));
    setLoading(false);

    if (deleteProduct.fulfilled.match(result)) {
      setMessage("Product deleted.");
      setTimeout(onClose, 1000);
    } else {
      setMessage((result.payload as string) || "Delete failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--color-card)] w-full max-w-2xl rounded-2xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold hover:text-red-500"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

        {message && (
          <p className="mb-3 text-sm text-[var(--color-accent)]">{message}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="input"
          />
          <input
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="SKU (leave blank to auto-generate)"
            className="input"
          />
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

          <input
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity (units in stock)"
            className="input"
          />
          <input
            name="minimumStock"
            value={formData.minimumStock}
            onChange={handleChange}
            placeholder="Minimum Stock"
            className="input"
          />
          <input
            name="costPrice"
            value={formData.costPrice}
            onChange={handleChange}
            placeholder="Cost Price"
            className="input"
          />
          <input
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            placeholder="Selling Price"
            className="input"
          />
        </div>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="input mt-4 h-24 resize-none"
        />
        <input
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
          placeholder="Barcode (leave blank to auto-generate)"
          className="input mt-3"
        />
        <input
          name="images"
          value={formData.images}
          onChange={handleChange}
          placeholder="Image URLs (comma separated)"
          className="input mt-3"
        />

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              formData.isActive
                ? "bg-green-600 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {formData.isActive ? "Active" : "Inactive"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white px-5 py-2 rounded-lg disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
