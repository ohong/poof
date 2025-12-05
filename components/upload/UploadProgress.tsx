"use client"

import Image from "next/image"

type FileStatus = "pending" | "uploading" | "processing" | "complete" | "error"

interface FileProgress {
  file: File
  preview: string
  status: FileStatus
  error?: string
}

interface UploadProgressProps {
  files: FileProgress[]
  onRemove?: (index: number) => void
}

export function UploadProgress({ files, onRemove }: UploadProgressProps) {
  if (files.length === 0) return null

  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case "pending":
        return "bg-[#8B8680]"
      case "uploading":
        return "bg-[#3D5A7C]"
      case "processing":
        return "bg-[#C45D3A]"
      case "complete":
        return "bg-[#2D5A3D]"
      case "error":
        return "bg-red-500"
    }
  }

  const getStatusText = (status: FileStatus) => {
    switch (status) {
      case "pending":
        return "Waiting..."
      case "uploading":
        return "Uploading..."
      case "processing":
        return "AI Processing..."
      case "complete":
        return "Complete"
      case "error":
        return "Error"
    }
  }

  return (
    <div className="w-full space-y-3 mt-6">
      {files.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-3 bg-white rounded-lg border border-[#E5E2DD]"
        >
          {/* Thumbnail */}
          <div className="relative w-14 h-14 rounded overflow-hidden bg-[#F0EDE8] flex-shrink-0">
            <Image
              src={item.preview}
              alt={item.file.name}
              fill
              className="object-cover"
            />
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm text-[#1A1A1A] truncate">
              {item.file.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(item.status)} ${
                  item.status === "uploading" || item.status === "processing"
                    ? "animate-pulse"
                    : ""
                }`}
              />
              <span className="font-body text-xs text-[#8B8680]">
                {item.error || getStatusText(item.status)}
              </span>
            </div>
          </div>

          {/* Remove Button (only when pending) */}
          {item.status === "pending" && onRemove && (
            <button
              onClick={() => onRemove(index)}
              className="p-2 text-[#8B8680] hover:text-[#C45D3A] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Status Icon */}
          {item.status === "complete" && (
            <div className="p-2 text-[#2D5A3D]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}

          {/* Loading Spinner */}
          {(item.status === "uploading" || item.status === "processing") && (
            <div className="p-2">
              <svg
                className="w-5 h-5 text-[#C45D3A] animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
