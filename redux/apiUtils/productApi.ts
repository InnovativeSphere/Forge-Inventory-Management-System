import axios from "axios";

/* =========================
   PAYLOAD TYPES
========================= */

export interface ProductPayload {
  _id?: string; // <-- Added for MongoDB reference
  name?: string;
  sku?: string;
  category?: string | null;
  supplier?: string | null;
  minimumStock?: number;
  costPrice?: number;
  sellingPrice?: number;
  description?: string;
  barcode?: string;
  images?: string[];
  quantity?: number; // include quantity when creating
}

/* =========================
   BASE URL
========================= */

const BASE_URL = "/api/products";

/* =========================
   API METHODS
========================= */

export const productApi = {
  createProduct: (payload: ProductPayload & { quantity: number }, token: string) =>
    axios.post(BASE_URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAllProducts: (token?: string) =>
    axios.get(
      BASE_URL,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    ),

  getProductById: (id: string, token?: string) =>
    axios.get(
      `${BASE_URL}?id=${id}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    ),

  updateProduct: (id: string, payload: ProductPayload, token: string) =>
    axios.put(`${BASE_URL}?id=${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteProduct: (id: string, token: string) =>
    axios.delete(`${BASE_URL}?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getLowStockProducts: (token: string) =>
    axios.get(`${BASE_URL}?action=low-stock`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
