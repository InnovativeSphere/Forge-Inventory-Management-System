import axios from "axios";

// --- Payload to create stock history ---
export interface StockHistoryPayload {
  product: string;
  changedBy: string;
  previousQuantity: number;
  newQuantity: number;
  action: string;
  note?: string;
}

// --- Stock history returned from API ---
export interface StockHistory {
  id: string;
  product: { id: string; name: string };
  changedBy: { id: string; username: string };
  previousQuantity: number;
  newQuantity: number;
  action: string;
  note?: string;
  createdAt: string;
}

const BASE_URL = "/api/stock-history";

export const stockHistoryApi = {
  createHistory: (payload: StockHistoryPayload, token: string) =>
    axios.post(BASE_URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAllHistory: () => axios.get(BASE_URL),

  getHistoryById: (id: string) => axios.get(`${BASE_URL}?id=${id}`),

  getHistoryByProduct: (productId: string) =>
    axios.get(`${BASE_URL}?action=product&id=${productId}`),

  getHistoryByUser: (userId: string) =>
    axios.get(`${BASE_URL}?action=user&id=${userId}`),

  deleteHistory: (id: string, token: string) =>
    axios.delete(`${BASE_URL}?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  searchHistory: (query: string) =>
    axios.get(`${BASE_URL}?action=search&q=${query}`),
};
