"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { UploadZone } from "@/components/upload/UploadZone";
import { UploadProgress, UploadStatus } from "@/components/upload/UploadProgress";
import { UploadRecord } from "@/types";
import { Check } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Map<string, UploadStatus>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map to track which upload ID corresponds to which filename
  const [uploadMap, setUploadMap] = useState<Map<string, string>>(new Map());

  const updateStatus = useCallback((filename: string, newStatus: UploadStatus) => {
    setStatus((prev) => {
      const next = new Map(prev);
      next.set(filename, newStatus);
      return next;
    });
  }, []);

  const processUploads = useCallback(
    async (uploads: UploadRecord[], fileMap: Map<string, string>) => {
      // Mark all successful uploads as "processing"
      uploads.forEach((upload) => {
        const filename = fileMap.get(upload.id);
        if (filename) {
          updateStatus(filename, "processing");
        }
      });

      try {
        const res = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploads }),
        });

        if (!res.ok) {
          throw new Error("Processing failed");
        }

        const data = await res.json();

        // Mark successful objects as complete
        if (data.objects) {
          // All processed objects are complete
          uploads.forEach((upload) => {
            const filename = fileMap.get(upload.id);
            if (filename) {
              updateStatus(filename, "complete");
            }
          });
        }

        // Mark errors
        if (data.errors) {
          data.errors.forEach((err: { uploadId: string }) => {
            const filename = fileMap.get(err.uploadId);
            if (filename) {
              updateStatus(filename, "error");
            }
          });
        }

        setIsComplete(true);
      } catch (err) {
        console.error("Process error:", err);
        // Mark all as error
        uploads.forEach((upload) => {
          const filename = fileMap.get(upload.id);
          if (filename) {
            updateStatus(filename, "error");
          }
        });
        setError("Failed to process images. Please try again.");
      }
    },
    [updateStatus]
  );

  const uploadFiles = useCallback(
    async (filesToUpload: File[]) => {
      setError(null);

      // Initialize all files as "uploading"
      const initialStatus = new Map<string, UploadStatus>();
      filesToUpload.forEach((f) => initialStatus.set(f.name, "uploading"));
      setStatus(initialStatus);

      // Build FormData
      const formData = new FormData();
      filesToUpload.forEach((f) => formData.append("images", f));

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await res.json();

        // Build map of uploadId -> filename for tracking
        const fileMap = new Map<string, string>();
        if (data.uploads) {
          // Uploads are in order, map by index
          data.uploads.forEach((upload: UploadRecord, index: number) => {
            if (filesToUpload[index]) {
              fileMap.set(upload.id, filesToUpload[index].name);
            }
          });
        }
        setUploadMap(fileMap);

        // Mark upload errors and collect error messages
        if (data.errors && data.errors.length > 0) {
          // Errors are now strings like "filename.jpg: Upload failed"
          data.errors.forEach((errMsg: string) => {
            const filename = errMsg.split(":")[0];
            if (filename) {
              updateStatus(filename, "error");
            }
          });
          // Show first error
          setError(data.errors[0]);
        }

        // If we have successful uploads, process them
        if (data.uploads && data.uploads.length > 0) {
          await processUploads(data.uploads, fileMap);
        } else if (data.errors && data.errors.length > 0) {
          setError(data.details?.[0] || data.error || "All uploads failed");
        }
      } catch (err) {
        console.error("Upload error:", err);
        // Mark all as error
        filesToUpload.forEach((f) => updateStatus(f.name, "error"));
        const message = err instanceof Error ? err.message : "Failed to upload images";
        setError(message);
      }
    },
    [updateStatus, processUploads]
  );

  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      setFiles(selectedFiles);
      setIsUploading(true);
      setIsComplete(false);
      uploadFiles(selectedFiles);
    },
    [uploadFiles]
  );

  const handleRetry = useCallback(
    (filename: string) => {
      const file = files.find((f) => f.name === filename);
      if (file) {
        // Retry just this file
        uploadFiles([file]);
      }
    },
    [files, uploadFiles]
  );

  const handleReset = useCallback(() => {
    setFiles([]);
    setStatus(new Map());
    setIsUploading(false);
    setIsComplete(false);
    setError(null);
    setUploadMap(new Map());
  }, []);

  // Completion state
  if (isComplete) {
    const completedCount = Array.from(status.values()).filter(
      (s) => s === "complete"
    ).length;

    return (
      <div className="mx-auto max-w-xl">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-medium tracking-tight">
            {completedCount} {completedCount === 1 ? "object" : "objects"} added
          </h1>

          <p className="mt-2 font-serif text-muted-foreground">
            Your objects have been cataloged and are ready to view.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleReset}
              className="border border-border px-6 py-2.5 text-sm font-medium tracking-wide transition-colors hover:bg-muted"
            >
              Upload more
            </button>
            <Link
              href="/gallery"
              className="bg-foreground px-6 py-2.5 text-sm font-medium tracking-wide text-background transition-opacity hover:opacity-90"
            >
              View Collection
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Upload in progress
  if (isUploading && files.length > 0) {
    return (
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Cataloging
            </h1>
            <p className="mt-2 font-serif text-muted-foreground">
              Transforming and describing your objects...
            </p>
          </div>

          <UploadProgress files={files} status={status} onRetry={handleRetry} />

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Initial state - show upload zone
  return (
    <div className="mx-auto max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Add Objects
          </h1>
          <p className="mt-2 font-serif text-muted-foreground">
            Upload photos of your belongings. We&apos;ll transform them into
            catalog-worthy images and write descriptions.
          </p>
        </div>

        <UploadZone onFilesSelected={handleFilesSelected} disabled={isUploading} />
      </motion.div>
    </div>
  );
}
