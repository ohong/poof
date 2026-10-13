"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  UploadCloud,
  X,
  Check,
  ArrowRight,
  RotateCcw,
  Camera,
  LoaderCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api-client";
import { preparePhoto } from "@/lib/prepare-photo";
type State =
  "queued" | "preparing" | "uploading" | "processing" | "ready" | "error";
type UploadRecord = {
  id: string;
  file: File;
  preview: string;
  state: State;
  error?: string;
  uploaded?: boolean;
  prepared?: File;
};
const labels: Record<State, string> = {
  queued: "Ready to add",
  preparing: "Preparing photo…",
  uploading: "Saving your photo…",
  processing: "Making your catalog photo…",
  ready: "In your collection",
  error: "Needs another try",
};
export function Upload() {
  const [files, setFiles] = useState<UploadRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("USD");
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const previews = useRef(new Map<string, string>());
  const records = useRef(files);
  useEffect(() => {
    records.current = files;
  }, [files]);
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  const hasProcessing = files.some((file) => file.state === "processing");
  useEffect(() => {
    if (!hasProcessing) return;
    let alive = true;
    const timer = setInterval(async () => {
      try {
        const result = await api<{
          items: {
            id: string;
            processing_state: string;
            warning: string | null;
          }[];
        }>("/api/items");
        if (!alive) return;
        setFiles((previous) =>
          previous.map((file) => {
            const item = result.items.find((item) => item.id === file.id);
            return item?.processing_state === "ready"
              ? { ...file, state: "ready", error: item.warning ?? undefined }
              : item?.processing_state === "failed"
                ? {
                    ...file,
                    state: "error",
                    error:
                      item.warning ?? "Processing stopped. Please try again.",
                  }
                : file;
          }),
        );
      } catch {
        /* Saved jobs continue on the server; the collection also offers recovery. */
      }
    }, 4000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [hasProcessing]);
  function choose(selected: File[]) {
    setError("");
    if (files.length + selected.length > 10) {
      setError(
        "You can add up to 10 photos in one batch. Remove a photo or start another batch.",
      );
      return;
    }
    const valid = selected.filter(
      (file) =>
        file.size <= 10 * 1024 * 1024 &&
        (/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) ||
          /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)),
    );
    if (valid.length !== selected.length)
      setError(
        "Some files were not added. Choose JPEG, PNG, WebP, or HEIC photos under 10 MB.",
      );
    setFiles((previous) => [
      ...previous,
      ...valid.map((file) => {
        const id = crypto.randomUUID();
        const preview = URL.createObjectURL(file);
        previews.current.set(id, preview);
        return { id, file, preview, state: "queued" as State };
      }),
    ]);
    if (input.current) input.current.value = "";
    if (camera.current) camera.current.value = "";
  }
  function update(id: string, changes: Partial<UploadRecord>) {
    setFiles((previous) =>
      previous.map((file) => (file.id === id ? { ...file, ...changes } : file)),
    );
  }
  function remove(id: string) {
    const url = previews.current.get(id);
    if (url) URL.revokeObjectURL(url);
    previews.current.delete(id);
    setFiles((previous) => previous.filter((file) => file.id !== id));
  }
  async function add(record: UploadRecord) {
    try {
      if (!record.uploaded) {
        update(record.id, { state: "preparing", error: undefined });
        const file = record.prepared || (await preparePhoto(record.file));
        const oldPreview = previews.current.get(record.id);
        if (oldPreview) URL.revokeObjectURL(oldPreview);
        const preview = URL.createObjectURL(file);
        previews.current.set(record.id, preview);
        update(record.id, { prepared: file, preview });
        const response = await api<{
          path: string;
          token: string;
          alreadySaved?: boolean;
        }>("/api/items", {
          method: "POST",
          body: JSON.stringify({
            id: record.id,
            type: file.type,
            size: file.size,
            currency,
          }),
        });
        if (!response.alreadySaved) {
          update(record.id, { state: "uploading" });
          const { error } = await createClient()
            .storage.from("object-images")
            .uploadToSignedUrl(response.path, response.token, file, {
              contentType: file.type,
            });
          if (error) {
            // A previous interrupted upload may already exist. The finalize endpoint validates it.
            const finalized = await fetch(`/api/items/${record.id}/process`, {
              method: "POST",
            });
            if (!finalized.ok)
              throw new Error("The photo could not be saved. Please retry.");
            update(record.id, { uploaded: true, state: "processing" });
            return;
          }
        }
        update(record.id, { uploaded: true });
      }
      await api(`/api/items/${record.id}/process`, { method: "POST" });
      update(record.id, { state: "processing", error: undefined });
    } catch (error) {
      update(record.id, {
        state: "error",
        error: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }
  async function start() {
    setBusy(true);
    setError("");
    const queue = records.current.filter(
      (file) => file.state === "queued" || file.state === "error",
    );
    // Two simultaneous uploads keep mobile memory and request pressure bounded.
    async function worker() {
      let record;
      while ((record = queue.shift())) await add(record);
    }
    await Promise.all([worker(), worker()]);
    setBusy(false);
  }
  const pending = files.filter(
    (file) => file.state === "queued" || file.state === "error",
  ).length;
  const ready = files.filter((file) => file.state === "ready").length;
  return (
    <div className="upload-page">
      <section className="upload-heading">
        <div className="eyebrow">ONE SMALL START</div>
        <h1>Meet your things.</h1>
        <p>
          A quick photo becomes a little clarity. Add one object per photo;
          we’ll take care of the background.
        </p>
      </section>
      <div
        className={`upload-drop ${dragging ? "dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!busy) choose(Array.from(event.dataTransfer.files));
        }}
      >
        <UploadCloud size={36} strokeWidth={1.3} />
        <h2>{dragging ? "Right here." : "A photo is all it takes."}</h2>
        <p>Drop your photos here, or choose from your camera roll.</p>
        <div className="upload-choices">
          <button
            className="button primary"
            onClick={() => input.current?.click()}
            disabled={busy || files.length >= 10}
          >
            <Plus size={18} />
            Choose photos
          </button>
          <button
            className="button outline camera-button"
            onClick={() => camera.current?.click()}
            disabled={busy || files.length >= 10}
          >
            <Camera size={18} />
            Take a photo
          </button>
        </div>
        <small>JPEG, PNG, WebP, HEIC · 10 MB each · Up to 10 photos</small>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          multiple
          hidden
          ref={input}
          onChange={(event) => choose(Array.from(event.target.files ?? []))}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          ref={camera}
          onChange={(event) => choose(Array.from(event.target.files ?? []))}
        />
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {files.length > 0 && (
        <>
          <div className="upload-list-heading">
            <span>
              {files.length} {files.length === 1 ? "PHOTO" : "PHOTOS"} · {ready}{" "}
              READY
            </span>
            <label>
              Sale estimates in{" "}
              <select
                aria-label="Currency for estimates"
                value={currency}
                disabled={busy || files.some((file) => file.uploaded)}
                onChange={(event) => setCurrency(event.target.value)}
              >
                {["USD", "CAD", "GBP", "EUR", "AUD"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="upload-list">
            {files.map((file) => (
              <div className="upload-record" key={file.id}>
                <div className="upload-thumbnail">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      width={64}
                      height={64}
                      unoptimized
                      alt={file.file.name}
                      onError={() => update(file.id, { preview: "" })}
                    />
                  ) : (
                    <Camera size={20} />
                  )}
                </div>
                <div>
                  <strong>{file.file.name}</strong>
                  <span className={file.state === "error" ? "error" : ""}>
                    {file.error || labels[file.state]}
                  </span>
                </div>
                {["preparing", "uploading", "processing"].includes(
                  file.state,
                ) ? (
                  <LoaderCircle size={20} className="spin" />
                ) : file.state === "ready" ? (
                  <Check size={20} />
                ) : (
                  <button
                    className="icon-button"
                    aria-label={`Remove ${file.file.name}`}
                    onClick={() => remove(file.id)}
                    disabled={busy}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="upload-actions">
            {pending > 0 && (
              <button
                className="button primary"
                disabled={busy}
                onClick={start}
              >
                {busy
                  ? "Adding your photos…"
                  : files.some((file) => file.state === "error")
                    ? "Retry unfinished photos"
                    : `Add ${pending} ${pending === 1 ? "object" : "objects"}`}
                <ArrowRight size={18} />
              </button>
            )}
            <Link className="button outline" href="/gallery">
              View collection
              <ArrowRight size={16} />
            </Link>
            {!busy && files.every((file) => file.state === "ready") && (
              <button
                className="text-button"
                onClick={() => files.forEach((file) => remove(file.id))}
              >
                <RotateCcw size={15} />
                Start another batch
              </button>
            )}
          </div>
          <p className="field-help">
            Once your photo is saved, processing continues even if you leave
            this page.
          </p>
        </>
      )}
      <div className="upload-notes">
        <div>
          <span>01</span>
          <p>
            <strong>One object, one photo.</strong>A clear view of the whole
            object works best.
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            <strong>Its character stays.</strong>Check the catalog photo against
            the original. AI can make mistakes.
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            <strong>Your collection is private.</strong>Photos are resized
            before upload. BFL and Anthropic process them to create your
            catalog.
          </p>
        </div>
      </div>
    </div>
  );
}
