"use client";

import { Heart, Loader2 } from "lucide-react";
import { useSavedProperties } from "@/lib/saved-properties/SavedPropertiesContext";

interface SavedPropertyButtonProps {
  propertyId: string;
  className?: string;
  iconClassName?: string;
  inline?: boolean;
}

export default function SavedPropertyButton({
  propertyId,
  className = "",
  iconClassName = "w-5 h-5",
  inline = false,
}: SavedPropertyButtonProps) {
  const { isSaved, isPending, toggleSavedProperty } = useSavedProperties();
  const saved = isSaved(propertyId);
  const pending = isPending(propertyId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleSavedProperty(propertyId);
      }}
      disabled={pending}
      className={`${inline ? "" : "absolute top-3 right-3"} p-2.5 rounded-full transition-all group/saved border shadow-sm z-20 ${
        saved
          ? "bg-primary/10 border-primary/30 text-primary shadow-md"
          : "bg-card/95 backdrop-blur-sm border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-background"
      } ${pending ? "cursor-not-allowed opacity-75" : ""} ${className}`}
      aria-label={saved ? "Remove from saved properties" : "Save property"}
      aria-pressed={saved}
      title={saved ? "Remove from saved properties" : "Save property"}
    >
      {pending ? (
        <Loader2 className={`${iconClassName} animate-spin`} />
      ) : (
        <Heart
          className={`${iconClassName} ${saved ? "fill-current" : "group-hover/saved:fill-primary/20"}`}
        />
      )}
    </button>
  );
}
