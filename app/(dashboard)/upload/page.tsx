"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { UploadZone } from "@/components/upload/UploadZone"
import { UploadProgress } from "@/components/upload/UploadProgress"
import { Button } from "@/components/ui/button"

type FileStatus = "pending" | "uploading" | "processing" | "complete" | "error"

interface FileProgress {
  file: File
  preview: string
  status: FileStatus
  error?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<FileProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: FileProgress[] = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
    }))
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10))
  }, [])

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }, [])

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    // Update all to uploading
    setFiles((prev) =>
      prev.map((f) => ({ ...f, status: "uploading" as FileStatus }))
    )

    try {
      // Step 1: Upload files
      const formData = new FormData()
      files.forEach((f) => formData.append("images", f.file))

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const uploadData = await uploadResponse.json()

      // Update to processing
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: "processing" as FileStatus }))
      )

      // Step 2: Process with AI
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploads: uploadData.uploads }),
      })

      if (!processResponse.ok) {
        throw new Error("Processing failed")
      }

      // Update to complete
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: "complete" as FileStatus }))
      )

      // Redirect to gallery after a short delay
      setTimeout(() => {
        router.push("/gallery")
      }, 1500)
    } catch (error) {
      console.error("Upload error:", error)
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as FileStatus,
          error: "Upload failed. Please try again.",
        }))
      )
    } finally {
      setIsUploading(false)
    }
  }

  const pendingCount = files.filter((f) => f.status === "pending").length
  const hasFiles = files.length > 0
  const allComplete = files.every((f) => f.status === "complete")

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl text-[#1A1A1A]">
          Add Objects
        </h1>
        <p className="font-body text-[#8B8680] mt-2">
          Upload photos of your belongings
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone
        onFilesSelected={handleFilesSelected}
        maxFiles={10 - files.length}
        disabled={isUploading || files.length >= 10}
      />

      {/* Progress */}
      <UploadProgress
        files={files}
        onRemove={!isUploading ? handleRemove : undefined}
      />

      {/* Actions */}
      {hasFiles && (
        <div className="flex justify-center gap-4">
          {!allComplete && (
            <>
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                disabled={isUploading}
                className="font-body"
              >
                Clear All
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || pendingCount === 0}
                className="font-body bg-[#1A1A1A] hover:bg-[#333] text-[#FAF8F5]"
              >
                {isUploading
                  ? "Processing..."
                  : `Upload ${files.length} ${files.length === 1 ? "Object" : "Objects"}`}
              </Button>
            </>
          )}
          {allComplete && (
            <Button
              onClick={() => router.push("/gallery")}
              className="font-body bg-[#2D5A3D] hover:bg-[#234A31] text-white"
            >
              View in Gallery
            </Button>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="text-center text-sm text-[#8B8680] font-body">
        <p>Tip: Photos with clear, centered objects work best for AI transformation.</p>
      </div>
    </div>
  )
}
