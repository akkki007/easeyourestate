import { configureStore } from "@reduxjs/toolkit";
import creditReducer from "./creditSlice";
import propertyReducer from "./propertySlice";

export const store = configureStore({
  reducer: {
    credits: creditReducer,
    properties: propertyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
