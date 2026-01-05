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
import AuthGuard from "../components/AuthGuard";

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
    <AuthGuard>
      <main className="min-h-screen p-4  bg-[var(--color-background)] text-[var(--color-foreground)]">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold mb-1 tracking-tight">
                Sales
              </h1>
              <p className="text-[var(--color-muted)] text-xs sm:text-sm md:text-base">
                Track your sales easily and efficiently
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <FiPlus className="inline text-xs sm:text-sm" /> Add Sale
            </Button>
          </div>

          {/* SEARCH BAR */}
          <div className="flex items-center gap-2 max-w-md mb-4 sm:mb-6">
            <FiSearch className="text-[var(--color-accent)] text-lg flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 sm:p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition"
            />
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex justify-center py-6 sm:py-10">
              <Spinner />
            </div>
          )}

          {/* ERROR */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* SALES LIST */}
          {!loading && filteredSales.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredSales.map((s) => (
                <Card
                  key={s._id}
                  className="p-4 sm:p-5 flex flex-col justify-between rounded-2xl hover:shadow-lg transition-shadow bg-[var(--color-card)]"
                >
                  <div className="mb-3">
                    <h2 className="text-base sm:text-lg md:text-lg font-bold truncate">
                      {s.product?.name ?? "Unknown Product"}
                    </h2>
                    <p className="text-[var(--color-muted)] text-xs sm:text-sm mt-1">
                      Sold by: {s.soldBy?.name ?? "Unknown"} | Payment: {s.paymentMethod ?? "N/A"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mb-2 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <p>
                        Qty: <span className="font-medium">{s.quantity}</span>
                      </p>
                      <p>
                        Total: <span className="font-medium">{s.totalPrice}</span>
                      </p>
                    </div>
                    <p className="text-[var(--color-muted)] text-xs sm:text-sm">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>

                  <div className="text-xs sm:text-sm mb-3 truncate">
                    Customer: {s.customerName ?? "N/A"} {s.customerContact ? `(${s.customerContact})` : ""}
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setEditSale(s)}
                    className="flex items-center gap-1 self-start text-xs sm:text-sm hover:scale-105 transition-transform"
                  >
                    <FiEdit className="inline text-xs sm:text-sm" /> Edit
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredSales.length === 0 && (
            <p className="text-[var(--color-muted)] text-center py-6 sm:py-10 text-xs sm:text-sm">
              No sales found. Click “Add Sale” to get started!
            </p>
          )}

          {/* CREATE / EDIT MODALS */}
          {showCreate && <CreateSale onClose={() => setShowCreate(false)} />}
          {editSale && <EditSale sale={editSale} onClose={() => setEditSale(null)} />}
        </div>
      </main>
    </AuthGuard>
  );
};

export default Sales;
