import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { categoryApi, Category, CategoryPayload } from "../apiUtils/categoryApi";

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

// --- SSR-safe token helper ---
const getToken = (token?: string | null): string => {
  if (token) return token;
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") ?? "";
  }
  return "";
};

// --- Async Thunks ---
export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (
    { payload, token }: { payload: CategoryPayload; token?: string },
    { rejectWithValue }
  ) => {
    try {
      const finalToken = getToken(token);
      const res = await categoryApi.createCategory(payload, finalToken);
      return res.data.category;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async (
    { _id, payload, token }: { _id: string; payload: Partial<CategoryPayload>; token?: string },
    { rejectWithValue }
  ) => {
    try {
      const finalToken = getToken(token);
      const res = await categoryApi.updateCategory(_id, payload, finalToken);
      return res.data.category;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update category");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async ({ _id, token }: { _id: string; token?: string }, { rejectWithValue }) => {
    try {
      const finalToken = getToken(token);
      await categoryApi.deactivateCategory(_id, finalToken); // soft delete
      return { _id };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete category");
    }
  }
);

export const fetchAllCategories = createAsyncThunk(
  "category/fetchAllCategories",
  async ({ token }: { token?: string } = {}, { rejectWithValue }) => {
    try {
      const finalToken = getToken(token);
      const res = await categoryApi.getAllCategories();
      return res.data.categories ?? res.data; // normalize
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const fetchCategoryBy_Id = createAsyncThunk(
  "category/fetchCategoryBy_Id",
  async ({ _id, token }: { _id: string; token?: string }, { rejectWithValue }) => {
    try {
      const finalToken = getToken(token);
      const res = await categoryApi.getCategoryById(_id,);
      return res.data.category ?? res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch category");
    }
  }
);

export const searchCategories = createAsyncThunk(
  "category/searchCategories",
  async ({ query, token }: { query: string; token?: string }, { rejectWithValue }) => {
    try {
      const finalToken = getToken(token);
      const res = await categoryApi.searchCategories(query);
      return res.data.categories ?? res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to search categories");
    }
  }
);

export const fetchCategoriesWithProductCount = createAsyncThunk(
  "category/fetchCategoriesWithProductCount",
  async ({ token }: { token?: string } = {}, { rejectWithValue }) => {
    try {
      const finalToken = getToken(token);
      const res = await categoryApi.getCategoriesWithProductCount(finalToken);
      return res.data.categories ?? res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch categories with product count"
      );
    }
  }
);

// --- Slice ---
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: CategoryState) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state: CategoryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    [
      createCategory,
      updateCategory,
      deleteCategory,
      fetchAllCategories,
      fetchCategoryBy_Id,
      searchCategories,
      fetchCategoriesWithProductCount,
    ].forEach((thunk) => {
      builder.addCase(thunk.pending, handlePending);
      builder.addCase(thunk.rejected, handleRejected);
    });

    builder
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.categories[index] = action.payload;
        if (state.selectedCategory?._id === action.payload._id)
          state.selectedCategory = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
        state.loading = false;
        state.categories = state.categories.filter((c) => c._id !== action.payload._id);
        if (state.selectedCategory?._id === action.payload._id)
          state.selectedCategory = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategoryBy_Id.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(searchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategoriesWithProductCount.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      });
  },
});

export const { clearSelectedCategory, clearError } = categorySlice.actions;
export default categorySlice.reducer;
