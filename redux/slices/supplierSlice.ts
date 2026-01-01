import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  supplierApi,
  Supplier,
  SupplierPayload,
  SupplierProducts,
} from "../apiUtils/supplierApi";
import type { RootState } from "../store/store";

/* -------------------- TYPES -------------------- */

interface SupplierState {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  supplierProducts: SupplierProducts | null;
  loading: boolean;
  error: string | null;
}

/* -------------------- INITIAL STATE -------------------- */

const initialState: SupplierState = {
  suppliers: [],
  selectedSupplier: null,
  supplierProducts: null,
  loading: false,
  error: null,
};

/* -------------------- HELPERS -------------------- */

// Normalize backend `_id` → frontend `id`
const normalizeSupplier = (supplier: any): Supplier => ({
  ...supplier,
  id: supplier.id ?? supplier._id,
});

// Token selector (no imaginary auth slice)
const selectToken = (state: RootState): string => {
  return state.user.token ?? localStorage.getItem("token") ?? "";
};

/* -------------------- THUNKS -------------------- */

export const createSupplier = createAsyncThunk(
  "supplier/create",
  async (payload: SupplierPayload, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState() as RootState);
      const res = await supplierApi.createSupplier(payload, token);
      return normalizeSupplier(res.data);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create supplier"
      );
    }
  }
);

export const fetchAllSuppliers = createAsyncThunk(
  "supplier/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await supplierApi.getAllSuppliers();
      return (res.data as any[]).map(normalizeSupplier);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch suppliers"
      );
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  "supplier/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await supplierApi.getSupplierById(id);
      return normalizeSupplier(res.data);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch supplier"
      );
    }
  }
);

export const updateSupplier = createAsyncThunk(
  "supplier/update",
  async (
    { id, payload }: { id: string; payload: Partial<SupplierPayload> },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = selectToken(getState() as RootState);
      const res = await supplierApi.updateSupplier(id, payload, token);
      return normalizeSupplier(res.data);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update supplier"
      );
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  "supplier/delete",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState() as RootState);
      await supplierApi.deleteSupplier(id, token);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete supplier"
      );
    }
  }
);

export const searchSuppliers = createAsyncThunk(
  "supplier/search",
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await supplierApi.searchSuppliers(query);
      return (res.data as any[]).map(normalizeSupplier);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to search suppliers"
      );
    }
  }
);

export const fetchProductsBySupplier = createAsyncThunk(
  "supplier/fetchProducts",
  async (supplierId: string, { rejectWithValue }) => {
    try {
      const res = await supplierApi.getProductsBySupplier(supplierId);
      return res.data as SupplierProducts;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch supplier products"
      );
    }
  }
);

export const fetchSupplierProductCount = createAsyncThunk(
  "supplier/fetchProductCount",
  async (supplierId: string, { rejectWithValue }) => {
    try {
      const res = await supplierApi.getSupplierProductCount(supplierId);
      return res.data as { supplierId: string; productCount: number };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch supplier product count"
      );
    }
  }
);

/* -------------------- SLICE -------------------- */

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
      state.supplierProducts = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: SupplierState) => {
      state.loading = true;
      state.error = null;
    };

    const rejected = (state: SupplierState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    [
      createSupplier,
      fetchAllSuppliers,
      fetchSupplierById,
      updateSupplier,
      deleteSupplier,
      searchSuppliers,
      fetchProductsBySupplier,
      fetchSupplierProductCount,
    ].forEach((thunk) => {
      builder.addCase(thunk.pending, pending);
      builder.addCase(thunk.rejected, rejected);
    });

    builder
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.unshift(action.payload);
      })
      .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSupplier = action.payload;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.suppliers.findIndex(
          (s) => s.id === action.payload.id
        );
        if (idx !== -1) state.suppliers[idx] = action.payload;
        if (state.selectedSupplier?.id === action.payload.id) {
          state.selectedSupplier = action.payload;
        }
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(
          (s) => s.id !== action.payload
        );
        if (state.selectedSupplier?.id === action.payload) {
          state.selectedSupplier = null;
        }
      })
      .addCase(searchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchProductsBySupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.supplierProducts = action.payload;
      })
      .addCase(fetchSupplierProductCount.fulfilled, (state, action) => {
        state.loading = false;
        if (
          state.supplierProducts &&
          state.supplierProducts.supplierId === action.payload.supplierId
        ) {
          state.supplierProducts.total = action.payload.productCount;
        }
      });
  },
});

/* -------------------- EXPORTS -------------------- */

export const { clearSelectedSupplier, clearError } = supplierSlice.actions;

export const selectSuppliers = (state: RootState) => state.supplier.suppliers;
export const selectSupplierLoading = (state: RootState) =>
  state.supplier.loading;
export const selectSupplierError = (state: RootState) => state.supplier.error;
export const selectSelectedSupplier = (state: RootState) =>
  state.supplier.selectedSupplier;

export default supplierSlice.reducer;
