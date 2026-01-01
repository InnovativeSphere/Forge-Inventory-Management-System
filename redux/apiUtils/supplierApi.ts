import axios from "axios";

export interface SupplierPayload {
  name: string;
  company?: string;
  email?: string;
  address?: string;
  phone: string;
}

export interface Supplier {
  _id: Key | null | undefined;
  id: string;
  name: string;
  company?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  phone: string;
}

export interface SupplierProducts {
  supplierId: string;
  total: number;
  products: { id: string; name: string }[];
}

const BASE_URL = "/api/suppliers";

export const supplierApi = {
  createSupplier: (payload: SupplierPayload, token: string) =>
    axios.post(BASE_URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAllSuppliers: () => axios.get(BASE_URL),

  getSupplierById: (id: string) => axios.get(`${BASE_URL}?id=${id}`),

  updateSupplier: (
    id: string,
    payload: Partial<SupplierPayload>,
    token: string
  ) =>
    axios.put(`${BASE_URL}?id=${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteSupplier: (id: string, token: string) =>
    axios.delete(`${BASE_URL}?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  searchSuppliers: (query: string) =>
    axios.get(`${BASE_URL}?action=search&q=${query}`),

  getProductsBySupplier: (supplierId: string) =>
    axios.get(`${BASE_URL}?action=products&id=${supplierId}`),

  getSupplierProductCount: (supplierId: string) =>
    axios.get(`${BASE_URL}?action=count&id=${supplierId}`),
};
