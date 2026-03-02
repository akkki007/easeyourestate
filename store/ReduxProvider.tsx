"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import ReduxHydrator from "./ReduxHydrator";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ReduxHydrator />
      {children}
    </Provider>
  );
}