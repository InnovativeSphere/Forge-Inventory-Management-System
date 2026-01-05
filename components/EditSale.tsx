"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { Sale } from "../redux/apiUtils/salesApi";
import { fetchAllProducts, Product } from "../redux/slices/productSlice";
import { deleteSaleThunk, updateSaleThunk } from "../redux/slices/salesSlice";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

import "../app/global.css";

interface EditSaleProps {
  sale: Sale;
  onClose: () => void;
}

const EditSale: React.FC<EditSaleProps> = ({ sale, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.product.products);

  const [selectedProduct, setSelectedProduct] = useState<string>(
    sale.product._id || sale.product.id
  );
  const [quantity, setQuantity] = useState<number>(sale.quantity);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "transfer" | "other"
  >(sale.paymentMethod ?? "cash");
  const [customerName, setCustomerName] = useState<string>(
    sale.customerName ?? ""
  );
  const [customerContact, setCustomerContact] = useState<string>(
    sale.customerContact ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!products.length) dispatch(fetchAllProducts());
  }, [dispatch, products.length]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity < 1) {
      setError("Please select a product and quantity");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(
        updateSaleThunk({
          id: sale._id,
          payload: {
            quantity,
            paymentMethod,
            customerName: customerName || undefined,
            customerContact: customerContact || undefined,
          },
        })
      ).unwrap();

      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update sale");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sale?")) return;

    setLoading(true);
    try {
      await dispatch(deleteSaleThunk({ id: sale._id })).unwrap();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 fade-in p-4 sm:p-6">
      <Card className="w-full max-w-md p-5 sm:p-6 relative space-y-4 scale-in sm:rounded-2xl shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors text-lg sm:text-xl"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Edit Sale</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form className="flex flex-col gap-2 sm:gap-3" onSubmit={handleUpdate}>
          <label className="flex flex-col text-[var(--color-foreground)] text-sm sm:text-sm">
            Product
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="mt-1 input text-sm sm:text-sm hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] transition"
              disabled
            >
              {products.map((p: Product) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-[var(--color-foreground)] text-sm sm:text-sm">
            Quantity
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 input text-sm sm:text-sm hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] transition"
            />
          </label>

          <label className="flex flex-col text-[var(--color-foreground)] text-sm sm:text-sm">
            Payment Method
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as "cash" | "card" | "transfer" | "other"
                )
              }
              className="mt-1 input text-sm sm:text-sm hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] transition"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col text-[var(--color-foreground)] text-sm sm:text-sm">
            Customer Name
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 input text-sm sm:text-sm hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] transition"
            />
          </label>

          <label className="flex flex-col text-[var(--color-foreground)] text-sm sm:text-sm">
            Customer Contact
            <input
              type="text"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className="mt-1 input text-sm sm:text-sm hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] transition"
            />
          </label>

          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3">
            <Button
              className="bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto hover:scale-105 transition-transform"
              type="button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Delete"}
            </Button>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto hover:scale-105 transition-transform"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex justify-center items-center gap-2 hover:scale-105 transition-transform"
              >
                {loading ? <Spinner size="sm" /> : "Update Sale"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditSale;
