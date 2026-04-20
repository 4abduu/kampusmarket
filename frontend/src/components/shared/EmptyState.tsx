"use client";

import { Package, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "package" | "search" | "error" | "default";
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon = "default",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case "package":
        return <Package className="h-16 w-16 text-muted-foreground/30" />;
      case "search":
        return <Search className="h-16 w-16 text-muted-foreground/30" />;
      case "error":
        return <AlertCircle className="h-16 w-16 text-red-400/60" />;
      default:
        return <Package className="h-16 w-16 text-muted-foreground/30" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {getIcon()}
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
