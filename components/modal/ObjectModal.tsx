"use client";

import { ObjectItem, PoofAction } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full sm:max-w-lg overflow-hidden bg-background shadow-2xl sm:rounded-sm max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.98, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 40 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Mobile drag indicator */}
              <div className="sm:hidden flex justify-center pt-2 pb-1">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Object Image */}
              <div className="aspect-square w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={object.transformedImageUrl || object.originalImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Museum Label */}
              <div className="p-5 sm:p-6 md:p-8">
                {/* Description - museum catalog style */}
                <motion.p
                  className="font-serif text-sm sm:text-base leading-relaxed text-foreground md:text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  {object.description}
                </motion.p>

                {/* Divider */}
                <motion.div
                  className="my-5 sm:my-6 h-px bg-border"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                />

                {/* Action Buttons - stack on mobile */}
                <motion.div
                  className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  <button
                    onClick={() => onAction("keep")}
                    className="border border-border bg-transparent px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium tracking-wide transition-all hover:bg-muted sm:flex-1"
                  >
                    Keep
                  </button>
                  <button
                    onClick={() => onAction("sell")}
                    className="border border-emerald-600 bg-transparent px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium tracking-wide text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white sm:flex-1"
                  >
                    Sell
                  </button>
                  <button
                    onClick={() => onAction("donate")}
                    className="border border-blue-600 bg-transparent px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium tracking-wide text-blue-700 transition-all hover:bg-blue-600 hover:text-white sm:flex-1"
                  >
                    Donate
                  </button>
                  <button
                    onClick={() => onAction("toss")}
                    className="border border-red-600 bg-transparent px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium tracking-wide text-red-700 transition-all hover:bg-red-600 hover:text-white sm:flex-1"
                  >
                    Toss
                  </button>
                </motion.div>

                {/* Subtle metadata */}
                <motion.p
                  className="mt-5 sm:mt-6 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                >
                  From your collection
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
