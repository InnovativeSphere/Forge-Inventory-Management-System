"use client";

import "../app/global.css";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/store";
import { Product } from "../redux/slices/productSlice";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ViewProductModal({ product, onClose }: Props) {
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const suppliers = useSelector((state: RootState) => state.supplier.suppliers);

  const categoryName =
    categories.find((cat) => cat._id === product.category)?.name || "N/A";
  const supplierName =
    suppliers.find((sup) => sup.id === product.supplier)?.name || "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-700 hover:text-red-500"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900">{product.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoField label="SKU" value={product.sku} />
          <InfoField label="Category" value={categoryName} />
          <InfoField label="Supplier" value={supplierName} />
          <InfoField label="Quantity" value={product.quantity} />
          <InfoField label="Minimum Stock" value={product.minimumStock} />
          <InfoField label="Cost Price" value={`₦${product.costPrice.toFixed(2)}`} />
          <InfoField label="Selling Price" value={`₦${product.sellingPrice.toFixed(2)}`} />
          <InfoField label="Active Status" value={product.isActive ? "Active" : "Inactive"} />

          {/* Description */}
          <div className="md:col-span-2 mt-2">
            <p className="text-gray-500 font-medium mb-1">Description</p>
            <p className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[60px]">
              {product.description || "No description"}
            </p>
          </div>

          {/* Barcode */}
          <div className="md:col-span-2 mt-2">
            <p className="text-gray-500 font-medium mb-1">Barcode</p>
            <p className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              {product.barcode || "N/A"}
            </p>
          </div>
        </div>

        {/* Images Carousel */}
        {product.images && product.images.length > 0 && (
          <div className="mt-5">
            <p className="text-gray-500 font-medium mb-2">Images</p>
            <div className="flex gap-3 overflow-x-auto py-1">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name}-${idx}`}
                  className="w-40 h-28 object-cover rounded-lg border border-gray-300 flex-shrink-0 transition-shadow duration-200 hover:shadow-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-gray-500 font-medium mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
