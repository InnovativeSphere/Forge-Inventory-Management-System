import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import { productApi } from "../apiUtils/productApi";
import type { RootState } from "../store/store";

// --- Product interface ---
export interface Product {
  _id?: string;
  id: string;
  name: string;
  category?: string | null;
  supplier?: string | null;
  sku: string;
  quantity: number;
  minimumStock: number;
  costPrice: number;
  sellingPrice: number;
  description?: string;
  barcode?: string;
  images?: string[];
  isActive?: boolean;
}

// --- StockHistory interface ---
export interface StockHistory {
  _id?: string;
  product: string;
  previousQuantity: number;
  newQuantity: number;
  action: "restock" | "sale";
  changedBy: string;
  note?: string;
  createdAt?: string;
}

// --- Slice state ---
interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  lowStockProducts: Product[];
  latestStockHistory: StockHistory | null; // <-- track latest log
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  lowStockProducts: [],
  latestStockHistory: null,
  loading: false,
  error: null,
};

// --- Helpers ---
const getToken = (token?: string | null): string => {
  if (token) return token;
  if (typeof window !== "undefined") return localStorage.getItem("token") ?? "";
  return "";
};

const extractId = (value: any): string | null =>
  !value ? null : typeof value === "string" ? value : value._id ?? null;

const mapMongoId = (product: any): Product => ({
  _id: product._id,
  id: product._id,
  name: product.name,
  sku: product.sku,
  category: extractId(product.category),
  supplier: extractId(product.supplier),
  quantity: product.quantity,
  minimumStock: product.minimumStock,
  costPrice: product.costPrice,
  sellingPrice: product.sellingPrice,
  description: product.description,
  barcode: product.barcode,
  images: product.images ?? [],
  isActive: product.isActive ?? true,
});

const normalizePayload = (payload: any) => ({
  ...payload,
  category: payload.category?.length === 24 ? payload.category : null,
  supplier: payload.supplier?.length === 24 ? payload.supplier : null,
  images: payload.images ?? [],
});

// --- Async Thunks ---
export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (
    { payload, token }: { payload: Omit<Product, "id">; token?: string },
    { rejectWithValue }
  ) => {
    try {
      const finalToken = getToken(token);
      const normalized = normalizePayload(payload);
      const res = await productApi.createProduct(normalized, finalToken);
      return {
        product: mapMongoId(res.data.product),
        stockHistory: res.data.stockHistory || null,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async (
    {
      id,
      payload,
      token,
    }: {
      id: string;
      payload: Partial<Omit<Product, "id">>;
      token?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const finalToken = getToken(token);
      const normalized = normalizePayload(payload);
      const res = await productApi.updateProduct(id, normalized, finalToken);
      return {
        product: mapMongoId(res.data.product),
        stockHistory: res.data.stockHistory || null,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (
    { id, token }: { id: string; token?: string },
    { rejectWithValue }
  ) => {
    try {
      const finalToken = getToken(token);
      await productApi.deleteProduct(id, finalToken);
      return { id };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "product/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productApi.getAllProducts();
      return res.data.map(mapMongoId);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchLowStockProducts = createAsyncThunk(
  "product/fetchLowStockProducts",
  async ({ token }: { token?: string } = {}, { rejectWithValue }) => {
    try {
      const finalToken = getToken(token);
      const res = await productApi.getLowStockProducts(finalToken);
      return res.data.map(mapMongoId);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch low stock products"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const res = await productApi.getProductById(id);
      return mapMongoId(res.data);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

// --- Slice ---
const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: ProductState) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state: ProductState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    [
      createProduct,
      updateProduct,
      deleteProduct,
      fetchAllProducts,
      fetchLowStockProducts,
      fetchProductById,
    ].forEach((thunk) => {
      builder.addCase(thunk.pending, pending);
      builder.addCase(thunk.rejected, rejected);
    });

    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload.product);
        state.latestStockHistory = action.payload.stockHistory;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.product;
        const i = state.products.findIndex((p) => p.id === updated.id);
        if (i !== -1) state.products[i] = updated;
        if (state.selectedProduct?.id === updated.id) {
          state.selectedProduct = updated;
        }
        // Update latest stock history if any
        if (action.payload.stockHistory) {
          state.latestStockHistory = action.payload.stockHistory;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (p) => p.id !== action.payload.id
        );
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = null;
        }
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockProducts = action.payload;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      });
  },
});

export const { clearSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;

// --- Selectors ---
export const selectProducts = (state: RootState) => state.product.products;
export const selectSelectedProduct = (state: RootState) =>
  state.product.selectedProduct;
export const selectLatestStockHistory = (state: RootState) =>
  state.product.latestStockHistory;

export const selectProductsWithRelations = createSelector(
  [
    selectProducts,
    (state: RootState) => state.category.categories,
    (state: RootState) => state.supplier.suppliers,
  ],
  (products, categories, suppliers) =>
    products.map((product) => ({
      ...product,
      category: categories.find((c) => c._id === product.category) || null,
      supplier: suppliers.find((s) => s.id === product.supplier) || null,
    }))
);
