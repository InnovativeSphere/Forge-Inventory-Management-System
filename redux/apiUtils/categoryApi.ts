import axios from "axios";

export interface CategoryPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  productCount?: number; 
}

const BASE_URL = "/api/category";

export const categoryApi = {
  createCategory: (payload: CategoryPayload, token: string) =>
    axios.post(BASE_URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAllCategories: () => axios.get(BASE_URL),

  getCategoryById: (id: string) => axios.get(`${BASE_URL}?id=${id}`),

  updateCategory: (
    id: string,
    payload: Partial<CategoryPayload>,
    token: string
  ) =>
    axios.put(`${BASE_URL}?id=${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deactivateCategory: (id: string, token: string) =>
    axios.delete(`${BASE_URL}?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  searchCategories: (query: string) =>
    axios.get(`${BASE_URL}?action=search&q=${query}`),

  getCategoriesWithProductCount: (token: string) =>
    axios.get(`${BASE_URL}?action=with-product-count`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
