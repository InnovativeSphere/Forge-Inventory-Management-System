"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { fetchAllProducts, Product } from "../redux/slices/productSlice";
import { createSaleThunk } from "../redux/slices/salesSlice";
import { fetchCurrentUser } from "../redux/slices/userSlice";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

import "../app/global.css";

interface CreateSaleProps {
  onClose: () => void;
}

const CreateSale: React.FC<CreateSaleProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const products = useSelector((state: RootState) => state.product.products);
  const user = useSelector((state: RootState) => state.user.user);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "transfer" | "other"
  >("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!products.length) dispatch(fetchAllProducts());
    if (!user && localStorage.getItem("token")) dispatch(fetchCurrentUser({}));
  }, [dispatch, products.length, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || quantity < 1) {
      setError("Please select a product and valid quantity");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(
        createSaleThunk({
          payload: {
            product: selectedProduct,
            quantity,
            paymentMethod,
            customerName: customerName || undefined,
            customerContact: customerContact || undefined,
          },
        })
      ).unwrap();

      onClose();
    } catch (err: any) {
      setError(err ?? "Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 fade-in">
      <Card className="w-full max-w-md p-6 relative space-y-4 scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold tracking-tight">Create Sale</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col text-[var(--color-foreground)] text-sm">
            Product
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="mt-1 input"
            >
              <option value="">Select a product</option>
              {products.map((p: Product) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-[var(--color-foreground)] text-sm">
            Quantity
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 input"
            />
          </label>

          <label className="flex flex-col text-[var(--color-foreground)] text-sm">
            Payment Method
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as "cash" | "card" | "transfer" | "other"
                )
              }
              className="mt-1 input"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col text-[var(--color-foreground)] text-sm">
            Customer Name
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 input"
            />
          </label>

          <label className="flex flex-col text-[var(--color-foreground)] text-sm">
            Customer Contact
            <input
              type="text"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className="mt-1 input"
            />
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size={"md"} /> : "Create Sale"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateSale;
