"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCreditsFromStorage } from "./creditSlice";

export default function ReduxHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    const saved = localStorage.getItem("searchCredits");
    if (saved) {
      dispatch(setCreditsFromStorage(parseInt(saved)));
    }
  }, [dispatch]);

  return null;
}