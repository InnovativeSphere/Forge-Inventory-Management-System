import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../slices/userSlice";
import productSlice from "../slices/productSlice";
import categorySlice from "../slices/categorySlice";
import stockHistorySlice from "../slices/stockHistorySlice";
import supplierSlice from "../slices/supplierSlice";
import salesSlice from "../slices/salesSlice";

// slices will be added here
export const store = configureStore({
  reducer: {
    user: userSlice,
    product: productSlice,
    category: categorySlice,
    stockHistory: stockHistorySlice,
    sales: salesSlice,
    supplier: supplierSlice,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
