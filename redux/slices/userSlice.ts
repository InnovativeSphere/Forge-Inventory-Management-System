import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import { userApi } from "../apiUtils/userApi";

/* =========================
   TOKEN HELPERS (SSR-SAFE)
========================= */

const saveToken = (token: string) => {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
};

const getToken = (): string | undefined => {
  if (typeof window !== "undefined")
    return localStorage.getItem("token") ?? undefined;
  return undefined;
};

const removeToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem("token");
};

// Select token from state OR localStorage
const selectToken = (state: RootState) => state.user.token ?? getToken();

/* =========================
   HELPERS
========================= */

const mapMongoId = (user: any) => ({
  ...user,
  _id: user._id,
  id: user._id,
});

/* =========================
   THUNKS
========================= */

/* --- AUTH --- */
export const registerUser = createAsyncThunk(
  "user/register",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await userApi.registerUser(payload);
      if (res.data?.token) saveToken(res.data.token);
      return mapMongoId(res.data.user);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Register failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await userApi.loginUser(payload);
      if (res.data?.token) saveToken(res.data.token);
      return mapMongoId(res.data.user);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

/* --- LOGOUT --- */
export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState() as RootState);
      if (!token) throw new Error("No token");

      // call backend logout
      await userApi.logoutUser(token);

      // clear localStorage
      removeToken();

      // return true to trigger fulfilled reducer
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

/* --- SELF --- */
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrent",
  async (args: { token?: string } = {}, { getState, rejectWithValue }) => {
    try {
      const stateToken = selectToken(getState() as RootState);
      const token = args.token ?? stateToken;
      if (!token) throw new Error("No token");
      const res = await userApi.fetchProfile(token);
      return mapMongoId(res.data.user);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Fetch failed");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (args: { updateData: any; token?: string }, { rejectWithValue }) => {
    try {
      const token = args.token ?? getToken();
      if (!token) throw new Error("No token");
      const res = await userApi.updateProfile(args.updateData, token);
      return mapMongoId(res.data.user);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const updateUserTheme = createAsyncThunk(
  "user/updateTheme",
  async (
    args: { theme: "light" | "dark"; token?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = args.token ?? getToken();
      if (!token) throw new Error("No token");
      const res = await userApi.updateUserTheme({ theme: args.theme }, token);
      return res.data.theme;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Theme update failed"
      );
    }
  }
);

export const toggleUserTheme = createAsyncThunk(
  "user/toggleTheme",
  async (args: { token?: string } = {}, { rejectWithValue }) => {
    try {
      const token = args.token ?? getToken();
      if (!token) throw new Error("No token");
      const res = await userApi.toggleUserTheme(token);
      return res.data.theme;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Toggle failed");
    }
  }
);

/* --- ADMIN --- */
export const createUserByAdmin = createAsyncThunk(
  "user/createByAdmin",
  async (payload: any, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState() as RootState);
      if (!token) throw new Error("No token");
      const res = await userApi.registerAdmin(payload);
      return mapMongoId(res.data.user);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Create failed");
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "user/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState() as RootState);
      if (!token) throw new Error("No token");
      const res = await userApi.getAllUsers(token);
      return res.data.users?.map(mapMongoId) ?? [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Fetch failed");
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchById",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState() as RootState);
      if (!token) throw new Error("No token");
      const res = await userApi.getUserById(id, token);
      return mapMongoId(res.data.user);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Fetch failed");
    }
  }
);

export const updateUserByAdmin = createAsyncThunk(
  "user/updateByAdmin",
  async (args: { id: string; data: any }, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState() as RootState);
      if (!token) throw new Error("No token");
      const res = await userApi.updateUserByAdmin(args.id, args.data, token);
      return mapMongoId(res.data.user);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const deleteUserByAdmin = createAsyncThunk(
  "user/deleteByAdmin",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState() as RootState);
      if (!token) throw new Error("No token");
      await userApi.deleteUser(id, token);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);

/* =========================
   SLICE
========================= */

const initialState = {
  user: null as any | null,
  token: getToken(),
  allUsers: [] as any[],
  currentUser: null as any | null,
  loading: false,
  error: null as string | null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.currentUser = null;
      state.token = undefined;
      removeToken();
    },
  },
  extraReducers: (builder) => {
    const pending = (state: typeof initialState) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state: typeof initialState, action: any) => {
      state.loading = false;
      state.error = action.payload;
    };

    [
      registerUser,
      loginUser,
      logoutUser,
      fetchCurrentUser,
      updateProfile,
      updateUserTheme,
      toggleUserTheme,
      createUserByAdmin,
      fetchAllUsers,
      fetchUserById,
      updateUserByAdmin,
      deleteUserByAdmin,
    ].forEach((thunk) => {
      builder.addCase(thunk.pending, pending);
      builder.addCase(thunk.rejected, rejected);
    });

    builder
      .addCase(registerUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token ?? getToken();
      })
      .addCase(loginUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token ?? getToken();
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.currentUser = null;
        state.token = undefined;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserTheme.fulfilled, (state, action: any) => {
        state.loading = false;
        if (state.user) state.user.theme = action.payload;
      })
      .addCase(toggleUserTheme.fulfilled, (state, action: any) => {
        state.loading = false;
        if (state.user) state.user.theme = action.payload;
      })
      .addCase(createUserByAdmin.fulfilled, (state, action: any) => {
        state.loading = false;
        if (action.payload) state.allUsers.push(action.payload);
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: any) => {
        state.loading = false;
        state.allUsers = action.payload ?? [];
      })
      .addCase(fetchUserById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentUser = action.payload ?? null;
      })
      .addCase(updateUserByAdmin.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentUser = action.payload;
        const index = state.allUsers.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) state.allUsers[index] = action.payload;
      })
      .addCase(deleteUserByAdmin.fulfilled, (state, action: any) => {
        state.loading = false;
        state.allUsers = state.allUsers.filter((u) => u._id !== action.payload);
        if (state.user?._id === action.payload) state.user = null;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
