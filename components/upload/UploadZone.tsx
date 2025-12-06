"use client";

import { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
// HEIC files sometimes have empty or generic MIME type in browsers
const HEIC_EXTENSIONS = [".heic", ".heif"];
const MAX_FILES = 10;
const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadZone({ onFilesSelected, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): File[] => {
    setError(null);
    const validFiles: File[] = [];

    for (const file of files) {
      // Check type - also check extension for HEIC (browsers often misreport MIME type)
      const isHeicByExtension = HEIC_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      const isValidType = ACCEPTED_TYPES.includes(file.type) || isHeicByExtension;

      if (!isValidType) {
        setError(`${file.name}: Unsupported format. Use JPEG, PNG, or HEIC.`);
        continue;
      }

      // Check size
      if (file.size > MAX_SIZE_BYTES) {
        setError(`${file.name}: File too large. Max ${MAX_SIZE_MB}MB.`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total count
    if (validFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed.`);
      return validFiles.slice(0, MAX_FILES);
    }

    return validFiles;
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const fileArray = Array.from(files);
      const validated = validateFiles(fileArray);

      if (validated.length > 0) {
        setSelectedFiles(validated);
      }
    },
    [disabled, validateFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  }, [selectedFiles, onFilesSelected]);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-6 sm:p-10 md:p-12 text-center transition-all",
          isDragging
            ? "border-foreground bg-foreground/5"
            : "border-border hover:border-foreground/50",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic,.heif"
          multiple
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Drop images here or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, or HEIC. Max {MAX_FILES} files, {MAX_SIZE_MB}MB each.
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
            </p>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="group relative">
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  {file.type.startsWith("image/") &&
                  !file.type.includes("heic") &&
                  !file.type.includes("heif") &&
                  !file.name.toLowerCase().endsWith(".heic") &&
                  !file.name.toLowerCase().endsWith(".heif") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      {(file.name.toLowerCase().endsWith(".heic") ||
                        file.name.toLowerCase().endsWith(".heif")) && (
                        <span className="text-[10px] text-muted-foreground">HEIC</span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute -right-1.5 -top-1.5 sm:-right-2 sm:-top-2 rounded-full bg-foreground p-0.5 sm:p-1 text-background opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="mt-1 truncate text-xs text-muted-foreground hidden sm:block">
                  {file.name}
                </p>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpload}
            disabled={disabled}
            className="w-full"
          >
            Upload {selectedFiles.length} object{selectedFiles.length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
