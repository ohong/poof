"use client";

import { ObjectItem, PoofAction } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ObjectModalProps {
  object: ObjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: PoofAction) => void;
}

export function ObjectModal({
  object,
  isOpen,
  onClose,
  onAction,
}: ObjectModalProps) {
  if (!object) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Object Details</DialogTitle>
          <DialogDescription className="sr-only">
            View and manage this object in your catalog
          </DialogDescription>
        </DialogHeader>

        {/* Object Preview */}
        <div
          className="aspect-square w-full rounded-md"
          style={{ backgroundColor: object.color }}
        />

        {/* Description */}
        <p className="font-serif text-base leading-relaxed text-foreground">
          {object.description}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={() => onAction("keep")}
            className="w-full"
          >
            Keep
          </Button>
          <Button
            onClick={() => onAction("sell")}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            Sell
          </Button>
          <Button
            onClick={() => onAction("donate")}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Donate
          </Button>
          <Button
            variant="destructive"
            onClick={() => onAction("toss")}
            className="w-full"
          >
            Toss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
