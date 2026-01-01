"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store/store";
import { fetchAllSalesThunk } from "../redux/slices/salesSlice";
import { Sale } from "../redux/apiUtils/salesApi";
import CreateSale from "../components/CreateSale";
import EditSale from "../components/EditSale";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { FiEdit, FiPlus, FiSearch } from "react-icons/fi";

const Sales: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showCreate, setShowCreate] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { sales, loading, error } = useSelector(
    (state: RootState) => state.sales
  );
  const { token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (token) dispatch(fetchAllSalesThunk({ token }));
  }, [dispatch, token]);

  const filteredSales = sales.filter((s) =>
    s.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-1">Sales</h1>
          <p className="text-[var(--color-muted)]">Track your sales easily and efficiently</p>
        </div>

        {/* ADD SALE BUTTON */}
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1"
        >
          <FiPlus className="inline text-xs" /> Add Sale
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-2 max-w-md mb-6">
        <FiSearch className="text-[var(--color-accent)] text-lg flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {/* ERROR */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* SALES LIST */}
      {!loading && filteredSales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSales.map((s) => (
            <Card
              key={s._id}
              className="p-4 flex flex-col justify-between hover:shadow-[var(--shadow-lift)] transition-shadow"
            >
              <div className="mb-2">
                <h2 className="text-lg font-bold">{s.product?.name ?? "Unknown Product"}</h2>
                <p className="text-[var(--color-muted)] text-sm">
                  Sold by: {s.soldBy?.name ?? "Unknown"} | Payment: {s.paymentMethod ?? "N/A"}
                </p>
              </div>

              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm">
                    Qty: <span className="font-medium">{s.quantity}</span>
                  </p>
                  <p className="text-sm">
                    Total: <span className="font-medium">{s.totalPrice}</span>
                  </p>
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>

              <div className="text-sm mb-3">
                Customer: {s.customerName ?? "N/A"} {s.customerContact ? `(${s.customerContact})` : ""}
              </div>

              {/* EDIT BUTTON */}
              <Button
                size="sm"
                variant="primary"
                onClick={() => setEditSale(s)}
                className="flex items-center gap-1 self-start"
              >
                <FiEdit className="inline text-xs" /> Edit
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredSales.length === 0 && (
        <p className="text-[var(--color-muted)] text-center py-10">
          No sales found. Click “Add Sale” to get started!
        </p>
      )}

      {/* CREATE / EDIT MODALS */}
      {showCreate && <CreateSale onClose={() => setShowCreate(false)} />}
      {editSale && <EditSale sale={editSale} onClose={() => setEditSale(null)} />}
    </div>
  );
};

export default Sales;
