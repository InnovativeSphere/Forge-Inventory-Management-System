import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { salesApi, Sale, SalePayload, SalesStats } from "../apiUtils/salesApi";

/* =======================
   State
======================= */
interface SalesState {
  sales: Sale[];
  selectedSale: Sale | null;
  stats: SalesStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [],
  selectedSale: null,
  stats: null,
  loading: false,
  error: null,
};

/* =======================
   Token helper
======================= */
const getToken = (token?: string | null): string =>
  token ??
  (typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "");

/* =======================
   Thunks
======================= */

// CREATE SALE
export const createSaleThunk = createAsyncThunk<
  Sale,
  { payload: SalePayload; token?: string },
  { rejectValue: string }
>("sales/create", async ({ payload, token }, { rejectWithValue }) => {
  try {
    const finalToken = getToken(token);
    const res = await salesApi.createSale(payload, finalToken);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create sale"
    );
  }
});

// FETCH ALL SALES
export const fetchAllSalesThunk = createAsyncThunk<
  Sale[],
  { params?: Record<string, any>; token?: string } | void,
  { rejectValue: string }
>("sales/fetchAll", async (args, { rejectWithValue }) => {
  try {
    const finalToken = getToken(args?.token);

    const res = await salesApi.getAllSales(finalToken, args?.params);

    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch sales"
    );
  }
});

// FETCH SALE BY ID
export const fetchSaleByIdThunk = createAsyncThunk<
  Sale,
  { id: string; token?: string },
  { rejectValue: string }
>("sales/fetchById", async ({ id, token }, { rejectWithValue }) => {
  try {
    const finalToken = getToken(token);
    const res = await salesApi.getSaleById(id, finalToken);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch sale"
    );
  }
});

// UPDATE SALE
export const updateSaleThunk = createAsyncThunk<
  Sale,
  {
    id: string;
    payload: Partial<
      SalePayload & {
        paymentMethod?: string;
        customerName?: string;
        customerContact?: string;
      }
    >;
    token?: string;
  },
  { rejectValue: string }
>("sales/update", async ({ id, payload, token }, { rejectWithValue }) => {
  try {
    const finalToken = getToken(token);
    const res = await salesApi.updateSale(id, payload, finalToken);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update sale"
    );
  }
});

// DELETE SALE
export const deleteSaleThunk = createAsyncThunk<
  string,
  { id: string; token?: string },
  { rejectValue: string }
>("sales/delete", async ({ id, token }, { rejectWithValue }) => {
  try {
    const finalToken = getToken(token);
    await salesApi.deleteSale(id, finalToken);
    return id;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete sale"
    );
  }
});

// FETCH STATS
export const fetchSalesStatsThunk = createAsyncThunk<
  SalesStats,
  { token?: string } | void,
  { rejectValue: string }
>("sales/stats", async (args, { rejectWithValue }) => {
  try {
    const finalToken = getToken(args?.token);
    const res = await salesApi.getSalesStats(finalToken);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch sales stats"
    );
  }
});

/* =======================
   Slice
======================= */
const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    clearSelectedSale: (state) => {
      state.selectedSale = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createSaleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSaleThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload);
      })
      .addCase(createSaleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // FETCH ALL
      .addCase(fetchAllSalesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSalesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(fetchAllSalesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // FETCH BY ID
      .addCase(fetchSaleByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSale = action.payload;
      })
      .addCase(fetchSaleByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // UPDATE
      .addCase(updateSaleThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) state.sales[index] = action.payload;
        if (state.selectedSale?._id === action.payload._id) {
          state.selectedSale = action.payload;
        }
      })

      // DELETE
      .addCase(deleteSaleThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter((sale) => sale._id !== action.payload);
      })

      // STATS
      .addCase(fetchSalesStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      });
  },
});

export const { clearSelectedSale, clearError } = salesSlice.actions;
export default salesSlice.reducer;
