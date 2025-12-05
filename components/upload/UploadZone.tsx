"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  disabled?: boolean
}

export function UploadZone({
  onFilesSelected,
  maxFiles = 10,
  disabled = false,
}: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        setError("Some files were rejected. Only JPEG and PNG images under 15MB are allowed.")
        return
      }

      if (acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed.`)
        return
      }

      onFilesSelected(acceptedFiles)
    },
    [maxFiles, onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 15 * 1024 * 1024, // 15MB
    maxFiles,
    disabled,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? "border-[#C45D3A] bg-[#C45D3A]/5"
            : "border-[#E5E2DD] hover:border-[#8B8680] hover:bg-[#F0EDE8]/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          {/* Upload Icon */}
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${isDragActive ? "bg-[#C45D3A]/10" : "bg-[#F0EDE8]"}
            `}
          >
            <svg
              className={`w-8 h-8 ${isDragActive ? "text-[#C45D3A]" : "text-[#8B8680]"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Text */}
          <div>
            <p className="font-body text-lg text-[#1A1A1A]">
              {isDragActive ? (
                "Drop your photos here"
              ) : (
                <>
                  <span className="text-[#C45D3A] font-medium">Click to upload</span>
                  {" "}or drag and drop
                </>
              )}
            </p>
            <p className="font-body text-sm text-[#8B8680] mt-1">
              JPEG or PNG, up to 15MB each (max {maxFiles} files)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="font-body text-sm text-[#C45D3A] mt-3 text-center">
          {error}
        </p>
      )}
    </div>
  )
}
