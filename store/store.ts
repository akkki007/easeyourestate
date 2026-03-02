import { configureStore } from "@reduxjs/toolkit";
import creditReducer from "./creditSlice";

export const store = configureStore({
  reducer: {
    credits: creditReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;