"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Posts a (pre-bound) server action after a native confirm. The action is
 * bound to its target id on the server and passed in as `action`.
 */
export function DeleteButton({
  action,
  confirmText = "Delete this item? This cannot be undone.",
  label = "Delete",
}: {
  action: () => Promise<void>;
  confirmText?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-destructive hover:text-destructive"
      >
        <Trash2 className="size-4" />
        {label}
      </Button>
    </form>
  );
}
