"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCreditsFromStorage } from "./creditSlice";

export default function ReduxHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUnlocks = localStorage.getItem("ownerUnlocks");
    const savedUnlockedProps = localStorage.getItem("unlockedProperties");

    const ownerUnlocks = savedUnlocks ? parseInt(savedUnlocks) : 0;
    const unlockedProperties = savedUnlockedProps
      ? JSON.parse(savedUnlockedProps)
      : [];

    dispatch(setCreditsFromStorage({ ownerUnlocks, unlockedProperties }));
  }, [dispatch]);

  return null;
}
