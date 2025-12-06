"use client";

import { cn } from "@/lib/utils";
import { Check, X, Loader2, Clock, Sparkles } from "lucide-react";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

interface UploadProgressProps {
  files: File[];
  status: Map<string, UploadStatus>;
  onRetry?: (filename: string) => void;
}

const statusConfig: Record<
  UploadStatus,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  pending: {
    icon: Clock,
    label: "Waiting",
    color: "text-muted-foreground",
  },
  uploading: {
    icon: Loader2,
    label: "Uploading",
    color: "text-blue-500",
  },
  processing: {
    icon: Sparkles,
    label: "AI Processing",
    color: "text-purple-500",
  },
  complete: {
    icon: Check,
    label: "Complete",
    color: "text-green-500",
  },
  error: {
    icon: X,
    label: "Failed",
    color: "text-red-500",
  },
};

export function UploadProgress({ files, status, onRetry }: UploadProgressProps) {
  if (files.length === 0) return null;

  const completedCount = Array.from(status.values()).filter(
    (s) => s === "complete"
  ).length;

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Processing {files.length} object{files.length !== 1 ? "s" : ""}
        </span>
        <span className="text-muted-foreground">
          {completedCount} of {files.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-foreground transition-all duration-500"
          style={{ width: `${(completedCount / files.length) * 100}%` }}
        />
      </div>

      {/* File list */}
      <div className="space-y-2">
        {files.map((file) => {
          const fileStatus = status.get(file.name) || "pending";
          const config = statusConfig[fileStatus];
          const Icon = config.icon;

          return (
            <div
              key={file.name}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
            >
              {/* Thumbnail */}
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                {file.type.startsWith("image/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className={cn("text-xs", config.color)}>{config.label}</p>
              </div>

              {/* Status icon */}
              <div className={cn("flex-shrink-0", config.color)}>
                <Icon
                  className={cn(
                    "h-5 w-5",
                    (fileStatus === "uploading" || fileStatus === "processing") &&
                      "animate-spin"
                  )}
                />
              </div>

              {/* Retry button for errors */}
              {fileStatus === "error" && onRetry && (
                <button
                  onClick={() => onRetry(file.name)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Retry
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
