import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  stockHistoryApi,
  StockHistory,
  StockHistoryPayload,
} from "../apiUtils/stockHistoryApi";

// --- State ---
interface StockHistoryState {
  history: StockHistory[];
  selectedHistory: StockHistory | null;
  loading: boolean;
  error: string | null;
}

const initialState: StockHistoryState = {
  history: [],
  selectedHistory: null,
  loading: false,
  error: null,
};

// --- SSR-safe token getter ---
const getToken = (token?: string | null): string =>
  token ??
  (typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "");

// --- Normalizer ---
const normalizeStockHistoryPayload = (
  payload: StockHistoryPayload
): StockHistoryPayload => ({
  product: payload.product,
  changedBy: payload.changedBy,
  previousQuantity: Number(payload.previousQuantity),
  newQuantity: Number(payload.newQuantity),
  action: payload.action,
  note: payload.note ?? "",
});

// --- Async Thunks ---
export const createStockHistory = createAsyncThunk<
  StockHistory, // return type
  { payload: StockHistoryPayload; token?: string }, // argument type
  { rejectValue: string }
>("stockHistory/create", async ({ payload, token }, { rejectWithValue }) => {
  try {
    // normalize the payload
    const normalizedPayload = normalizeStockHistoryPayload(payload);

    // send to API
    const res = await stockHistoryApi.createHistory(
      normalizedPayload,
      getToken(token)
    );

    // return populated or raw data
    return res.data as StockHistory;
  } catch (err: any) {
    console.error("StockHistory Create Error:", err);
    return rejectWithValue(
      err.response?.data?.message || "Failed to create history entry"
    );
  }
});

export const deleteStockHistory = createAsyncThunk(
  "stockHistory/delete",
  async (
    { id, token }: { id: string; token?: string },
    { rejectWithValue }
  ) => {
    try {
      await stockHistoryApi.deleteHistory(id, getToken(token));
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete history entry"
      );
    }
  }
);
export const fetchAllStockHistory = createAsyncThunk<
  StockHistory[],
  { token?: string } | void,
  { rejectValue: string }
>("stockHistory/fetchAll", async (args, { rejectWithValue }) => {
  try {
    const finalToken =
      args?.token ??
      (typeof window !== "undefined"
        ? localStorage.getItem("token") ?? ""
        : "");
    const res = await stockHistoryApi.getAllHistory();

    const sortedLatest = (res.data as StockHistory[])
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 15);

    return sortedLatest;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch stock history"
    );
  }
});

export const fetchHistoryByProduct = createAsyncThunk(
  "stockHistory/fetchByProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await stockHistoryApi.getHistoryByProduct(productId);
      return res.data.history as StockHistory[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch history by product"
      );
    }
  }
);

export const fetchHistoryByUser = createAsyncThunk(
  "stockHistory/fetchByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await stockHistoryApi.getHistoryByUser(userId);
      return res.data.history as StockHistory[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch history by user"
      );
    }
  }
);

export const searchStockHistory = createAsyncThunk(
  "stockHistory/search",
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await stockHistoryApi.searchHistory(query);
      return res.data as StockHistory[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to search history"
      );
    }
  }
);

// --- Slice ---
const stockHistorySlice = createSlice({
  name: "stockHistory",
  initialState,
  reducers: {
    clearSelectedHistory: (state) => {
      state.selectedHistory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: StockHistoryState) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (
      state: StockHistoryState,
      action: PayloadAction<any>
    ) => {
      state.loading = false;
      state.error = action.payload;
    };

    [
      createStockHistory,
      deleteStockHistory,
      fetchAllStockHistory,
      fetchHistoryByProduct,
      fetchHistoryByUser,
      searchStockHistory,
    ].forEach((thunk) => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.rejected, handleRejected);
    });

    builder
      .addCase(
        createStockHistory.fulfilled,
        (state, action: PayloadAction<StockHistory>) => {
          state.loading = false;
          state.history.unshift(action.payload);
        }
      )
      .addCase(
        deleteStockHistory.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.history = state.history.filter((h) => h.id !== action.payload);
          if (state.selectedHistory?.id === action.payload)
            state.selectedHistory = null;
        }
      )
      .addCase(
        fetchAllStockHistory.fulfilled,
        (state, action: PayloadAction<StockHistory[]>) => {
          state.loading = false;
          state.history = action.payload;
        }
      )
      .addCase(
        fetchHistoryByProduct.fulfilled,
        (state, action: PayloadAction<StockHistory[]>) => {
          state.loading = false;
          state.history = action.payload;
        }
      )
      .addCase(
        fetchHistoryByUser.fulfilled,
        (state, action: PayloadAction<StockHistory[]>) => {
          state.loading = false;
          state.history = action.payload;
        }
      )
      .addCase(
        searchStockHistory.fulfilled,
        (state, action: PayloadAction<StockHistory[]>) => {
          state.loading = false;
          state.history = action.payload;
        }
      );
  },
});

export const { clearSelectedHistory, clearError } = stockHistorySlice.actions;

export default stockHistorySlice.reducer;
