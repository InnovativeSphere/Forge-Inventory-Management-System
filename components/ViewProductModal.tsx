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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-lg shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)]">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 grid gap-3 text-xs sm:text-sm"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          }}
        >
          <InfoField label="SKU" value={product.sku} />
          <InfoField label="Category" value={categoryName} />
          <InfoField label="Supplier" value={supplierName} />
          <InfoField label="Quantity" value={product.quantity} />
          <InfoField label="Minimum Stock" value={product.minimumStock} />
          <InfoField
            label="Cost Price"
            value={`₦${product.costPrice.toFixed(2)}`}
          />
          <InfoField
            label="Selling Price"
            value={`₦${product.sellingPrice.toFixed(2)}`}
          />
          <InfoField
            label="Active Status"
            value={product.isActive ? "Active" : "Inactive"}
          />

          {/* Description */}
          <div className="col-span-full">
            <span className="text-[var(--color-muted)] text-xs mb-1 block">
              Description
            </span>
            <p className="bg-[var(--color-card)] p-3 rounded border border-[var(--color-border)] min-h-[60px] text-[var(--color-muted)]">
              {product.description || "No description"}
            </p>
          </div>

          {/* Barcode */}
          <div className="col-span-full">
            <span className="text-[var(--color-muted)] text-xs mb-1 block">
              Barcode
            </span>
            <p className="bg-[var(--color-card)] p-3 rounded border border-[var(--color-border)] text-[var(--color-muted)]">
              {product.barcode || "N/A"}
            </p>
          </div>

          {/* Images */}
          {product.images && product.images.length > 0 && (
            <div className="col-span-full">
              <span className="text-[var(--color-muted)] text-xs mb-1 block">
                Images
              </span>
              <div className="flex gap-3 overflow-x-auto py-1">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name}-${idx}`}
                    className="w-36 h-24 object-cover rounded-lg border border-[var(--color-border)] flex-shrink-0 transition-shadow duration-200 hover:shadow-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-[var(--color-border)] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--color-accent-hover)] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <span className="text-[var(--color-muted)] text-xs mb-1 block">
        {label}
      </span>
      <p className="font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}
