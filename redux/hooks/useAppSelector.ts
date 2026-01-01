import { TypedUseSelectorHook, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
