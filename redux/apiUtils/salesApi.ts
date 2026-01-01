import axios from "axios";

/* =======================
   Payloads (Request)
======================= */

export interface SalePayload {
  product: string;
  quantity: number;
  paymentMethod?: "cash" | "card" | "transfer" | "other";
  customerName?: string;
  customerContact?: string;
  discount?: number;
  notes?: string;
  status?: "completed" | "cancelled" | "refunded";
}

/* =======================
   Models (Response)
======================= */

export interface Sale {
  _id: string;
  product: any;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  soldBy: any; // populated user object
  paymentMethod?: "cash" | "card" | "transfer" | "other";
  customerName?: string;
  customerContact?: string;
  status: "completed" | "cancelled" | "refunded";
  reference: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/* =======================
   Stats
======================= */

export interface SalesStats {
  daily: { _id: string; total: number; count: number }[];
  paymentBreakdown: { _id: string; total: number }[];
}

/* =======================
   API
======================= */

const BASE_URL = "/api/sales";

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const salesApi = {
  createSale: (payload: SalePayload, token: string) =>
    // soldBy removed, backend assigns automatically from JWT
    axios.post(BASE_URL, payload, authHeader(token)),

  getAllSales: (token: string, params?: Record<string, any>) =>
    axios.get<Sale[]>(BASE_URL, {
      params,
      ...authHeader(token),
    }),

  getSaleById: (id: string, token: string) =>
    axios.get<Sale>(`${BASE_URL}?id=${id}`, authHeader(token)),

  updateSale: (id: string, payload: Partial<SalePayload>, token: string) =>
    // soldBy cannot be updated from frontend
    axios.put(`${BASE_URL}?id=${id}`, payload, authHeader(token)),

  deleteSale: (id: string, token: string) =>
    axios.delete(`${BASE_URL}?id=${id}`, authHeader(token)),

  getSalesStats: (token: string) =>
    axios.get(`${BASE_URL}?action=stats`, authHeader(token)),
};
