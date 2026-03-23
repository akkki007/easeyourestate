"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth/AuthContext";

type SavedPropertiesContextValue = {
  savedIds: string[];
  isHydrated: boolean;
  isLoaded: boolean;
  isSaved: (propertyId: string) => boolean;
  isPending: (propertyId: string) => boolean;
  refreshSaved: () => Promise<void>;
  saveProperty: (propertyId: string) => Promise<boolean>;
  unsaveProperty: (propertyId: string) => Promise<boolean>;
  toggleSavedProperty: (propertyId: string) => Promise<boolean | null>;
};

const SavedPropertiesContext = createContext<SavedPropertiesContextValue | null>(null);

export function SavedPropertiesProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, isHydrated: isAuthHydrated } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const refreshSaved = useCallback(async () => {
    if (!isAuthHydrated) {
      return;
    }

    if (!isAuthenticated || !token) {
      setSavedIds([]);
      setIsLoaded(true);
      return;
    }

    try {
      const response = await fetch("/api/user/saved-properties?idsOnly=1", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load saved properties");
      }

      const data = await response.json();
      setSavedIds(Array.isArray(data.propertyIds) ? data.propertyIds : []);
    } catch {
      setSavedIds([]);
    } finally {
      setIsLoaded(true);
    }
  }, [isAuthenticated, isAuthHydrated, token]);

  useEffect(() => {
    void refreshSaved();
  }, [refreshSaved]);

  const mutateSaved = useCallback(
    async (propertyId: string, action: "save" | "unsave") => {
      if (!isAuthenticated || !token) {
        toast.error("Please login to save properties");
        return null;
      }

      if (pendingIds.includes(propertyId)) {
        return action === "save";
      }

      setPendingIds((prev) => [...prev, propertyId]);

      const nextSavedState = action === "save";
      setSavedIds((prev) =>
        nextSavedState
          ? (prev.includes(propertyId) ? prev : [...prev, propertyId])
          : prev.filter((id) => id !== propertyId),
      );

      try {
        const response = await fetch(`/api/user/saved-properties/${propertyId}`, {
          method: nextSavedState ? "POST" : "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Failed to update saved properties");
        }

        toast.success(nextSavedState ? "Property saved" : "Property removed from saved");
        return nextSavedState;
      } catch (error) {
        setSavedIds((prev) =>
          nextSavedState
            ? prev.filter((id) => id !== propertyId)
            : (prev.includes(propertyId) ? prev : [...prev, propertyId]),
        );
        toast.error(error instanceof Error ? error.message : "Failed to update saved properties");
        return null;
      } finally {
        setPendingIds((prev) => prev.filter((id) => id !== propertyId));
      }
    },
    [isAuthenticated, pendingIds, token],
  );

  const saveProperty = useCallback(
    async (propertyId: string) => {
      const result = await mutateSaved(propertyId, "save");
      return result === true;
    },
    [mutateSaved],
  );

  const unsaveProperty = useCallback(
    async (propertyId: string) => {
      const result = await mutateSaved(propertyId, "unsave");
      return result === false;
    },
    [mutateSaved],
  );

  const toggleSavedProperty = useCallback(
    async (propertyId: string) => {
      const currentlySaved = savedIds.includes(propertyId);
      return mutateSaved(propertyId, currentlySaved ? "unsave" : "save");
    },
    [mutateSaved, savedIds],
  );

  const value = useMemo<SavedPropertiesContextValue>(
    () => ({
      savedIds,
      isHydrated: isAuthHydrated,
      isLoaded,
      isSaved: (propertyId: string) => savedIds.includes(propertyId),
      isPending: (propertyId: string) => pendingIds.includes(propertyId),
      refreshSaved,
      saveProperty,
      unsaveProperty,
      toggleSavedProperty,
    }),
    [isAuthHydrated, isLoaded, pendingIds, refreshSaved, saveProperty, savedIds, toggleSavedProperty, unsaveProperty],
  );

  return <SavedPropertiesContext.Provider value={value}>{children}</SavedPropertiesContext.Provider>;
}

export function useSavedProperties() {
  const context = useContext(SavedPropertiesContext);

  if (!context) {
    throw new Error("useSavedProperties must be used within a SavedPropertiesProvider");
  }

  return context;
}
