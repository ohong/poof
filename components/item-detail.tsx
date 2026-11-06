"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import {
  X,
  Check,
  Tag,
  HeartHandshake,
  Trash2,
  Copy,
  Share2,
  Download,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import type { DisplayItem } from "@/lib/sample";
import { categories, type Disposition, type InventoryItem } from "@/types";
import { ItemImage } from "./item-image";
type Edits = Pick<
  InventoryItem,
  | "name"
  | "description"
  | "category"
  | "location"
  | "condition"
  | "notes"
  | "listing_title"
  | "listing_body"
  | "asking_price"
  | "currency"
>;
function editable(item: DisplayItem): Edits {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    location: item.location,
    condition: item.condition,
    notes: item.notes,
    listing_title: item.listing_title,
    listing_body: item.listing_body,
    asking_price: item.asking_price,
    currency: item.currency,
  };
}
const decisions = [
  { value: "keep", label: "Keep", Icon: Check },
  { value: "sell", label: "Sell", Icon: Tag },
  { value: "donate", label: "Donate", Icon: HeartHandshake },
  { value: "toss", label: "Toss", Icon: Trash2 },
] as const;
type Operation = "save" | "copy" | "share" | "decision" | "remove" | "retry";
export function ItemDetail({
  item,
  onClose,
  onRestoreFocus,
  onSave,
  onAction,
  onRetry,
  onRemove,
  demo = false,
}: {
  item: DisplayItem;
  onClose: () => void;
  onRestoreFocus: () => void;
  onSave: (edits: Edits) => Promise<void>;
  onAction: (
    value: Disposition,
    animate?: boolean,
    edits?: Edits,
  ) => Promise<void>;
  onRetry: () => Promise<void>;
  onRemove: () => Promise<void>;
  demo?: boolean;
}) {
  const [tab, setTab] = useState<"details" | "listing">("details");
  const [original, setOriginal] = useState(false);
  const [draft, setDraft] = useState<Edits>(() => editable(item));
  const saved = editable(item);
  const dirty = (Object.keys(saved) as (keyof Edits)[]).some(
    (key) => draft[key] !== saved[key],
  );
  const [operation, setOperation] = useState<Operation | null>(null);
  const busy = operation !== null;
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restoreAfterRun = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!busy) {
      const target = restoreAfterRun.current;
      restoreAfterRun.current = null;
      if (target?.isConnected) target.focus({ preventScroll: true });
    }
  }, [busy]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (error && !draft.name.trim()) nameInput.current?.focus();
  }, [error, draft.name]);
  const processing = item.processing_state === "processing";
  const money = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: draft.currency,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  const estimate =
    item.price_low !== null &&
    item.price_high !== null &&
    draft.currency === item.currency
      ? `${money(item.price_low)}–${money(item.price_high)}`
      : null;
  function requestClose() {
    if (busy) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  }
  async function run(action: () => Promise<void>, kind: Operation = "save") {
    if (kind !== "remove" && kind !== "retry" && !draft.name.trim()) {
      setTab("details");
      setError("Enter a name for this object.");
      return;
    }
    restoreAfterRun.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setOperation(kind);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setOperation(null);
    }
  }
  const listing = () =>
    `${draft.listing_title || draft.name}\n${draft.asking_price !== null ? money(draft.asking_price) : "Price: open to offers"}\n\n${draft.listing_body || draft.description}`;
  async function saveDraft() {
    const clean = { ...draft, name: draft.name.trim() };
    await onSave(clean);
    setDraft(clean);
  }
  async function copy() {
    await navigator.clipboard.writeText(listing());
    try {
      await saveDraft();
    } catch {
      throw new Error(
        "Listing copied, but the draft could not be saved. Keep this view open and try Save draft.",
      );
    }
    setMessage(
      demo
        ? "Listing copied. Sample edits stay in this tab."
        : "Listing copied. Add a photo when you post it.",
    );
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: draft.listing_title || draft.name,
          text: listing(),
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        throw error;
      }
      try {
        await saveDraft();
      } catch {
        throw new Error(
          "Listing shared, but the draft could not be saved. Keep this view open and try Save draft.",
        );
      }
      setMessage("Listing shared.");
    } else await copy();
  }
  function decide(value: Disposition, animate: boolean) {
    return run(async () => {
      await onAction(
        value,
        animate,
        dirty ? { ...draft, name: draft.name.trim() } : undefined,
      );
    }, "decision");
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="item-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onRestoreFocus();
          }}
        >
          <div className="dialog-toolbar">
            <span>{demo ? "Sample object" : "Object in your collection"}</span>
            <button
              ref={closeButton}
              className="dialog-close icon-button"
              aria-label="Close object details"
              onClick={requestClose}
              disabled={busy}
            >
              <X size={22} />
            </button>
          </div>
          <div className="detail-body">
            <div className="detail-visual">
              <div className="detail-photo">
                <ItemImage
                  item={item}
                  original={original}
                  eager
                  sizes="(max-width: 640px) 86vw, 460px"
                />
              </div>
              {!demo && (
                <div className="image-switch" aria-label="Photo view">
                  <button
                    aria-pressed={!original}
                    onClick={() => setOriginal(false)}
                  >
                    Catalog photo
                  </button>
                  <button
                    aria-pressed={original}
                    onClick={() => setOriginal(true)}
                  >
                    Original photo
                  </button>
                </div>
              )}
              <div className="detail-caption">
                <span>{item.category}</span>
                {demo && <span>Illustrative photo</span>}
              </div>
            </div>
            <div className="detail-content">
              <Dialog.Title className="detail-title">{item.name}</Dialog.Title>
              <Dialog.Description
                className="detail-description"
              >
                {item.description ||
                  "Every object starts with a photo. Add its story below."}
              </Dialog.Description>
              {processing && (
                <p className="notice" role="status">
                  Preparing your catalog photo and sale draft. You can close
                  this view; processing continues.
                </p>
              )}
              {item.warning && (
                <div className="notice">
                  <p>{item.warning}</p>
                  {item.deleting ? (
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => run(onRemove, "remove")}
                    >
                      Retry removal
                    </button>
                  ) : (
                    item.attempts < 3 && (
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() => run(onRetry, "retry")}
                      >
                        Retry AI processing <RotateCcw size={14} />
                      </button>
                    )
                  )}
                </div>
              )}
              {item.processing_state === "uploaded" && (
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => run(onRetry, "retry")}
                >
                  Finish processing <ArrowRight size={16} />
                </button>
              )}
              <div
                className="detail-tabs"
                role="tablist"
                aria-label="Object information"
                onKeyDown={(event) => {
                  if (
                    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  )
                    return;
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? "details"
                      : event.key === "End"
                        ? "listing"
                        : tab === "details"
                          ? "listing"
                          : "details";
                  setTab(next);
                  event.currentTarget
                    .querySelector<HTMLButtonElement>(`#${next}-tab`)
                    ?.focus();
                }}
              >
                <button
                  id="details-tab"
                  role="tab"
                  tabIndex={tab === "details" ? 0 : -1}
                  aria-selected={tab === "details"}
                  aria-controls="details-panel"
                  onClick={() => setTab("details")}
                >
                  Object details
                </button>
                <button
                  id="listing-tab"
                  role="tab"
                  tabIndex={tab === "listing" ? 0 : -1}
                  aria-selected={tab === "listing"}
                  aria-controls="listing-panel"
                  onClick={() => setTab("listing")}
                >
                  Sale draft <Tag size={14} />
                </button>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  run(async () => {
                    await saveDraft();
                    setMessage("Changes saved.");
                  });
                }}
              >
                <fieldset disabled={busy || processing || item.deleting}>
                  {tab === "details" ? (
                    <div
                      role="tabpanel"
                      id="details-panel"
                      aria-labelledby="details-tab"
                      className="edit-fields"
                    >
                      <label>
                        Object name
                        <input
                          ref={nameInput}
                          aria-invalid={Boolean(error && !draft.name.trim())}
                          aria-describedby={
                            error && !draft.name.trim()
                              ? "object-edit-error"
                              : undefined
                          }
                          value={draft.name}
                          maxLength={120}
                          required
                          onChange={(event) =>
                            setDraft({ ...draft, name: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Description
                        <textarea
                          value={draft.description}
                          maxLength={1200}
                          rows={3}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              description: event.target.value,
                            })
                          }
                        />
                      </label>
                      <div className="field-pair">
                        <label>
                          Category
                          <select
                            value={draft.category}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                category: event.target
                                  .value as InventoryItem["category"],
                              })
                            }
                          >
                            {categories.map((value) => (
                              <option key={value}>{value}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Room or location
                          <input
                            value={draft.location}
                            placeholder="e.g. Kitchen"
                            maxLength={120}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                location: event.target.value,
                              })
                            }
                          />
                        </label>
                      </div>
                      <label>
                        Condition
                        <textarea
                          value={draft.condition}
                          rows={2}
                          maxLength={600}
                          placeholder="Check for wear, damage, and missing parts"
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              condition: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Your notes
                        <textarea
                          value={draft.notes}
                          rows={2}
                          maxLength={2000}
                          placeholder="Where it came from. Why you kept it."
                          onChange={(event) =>
                            setDraft({ ...draft, notes: event.target.value })
                          }
                        />
                      </label>
                      <button className="button outline" type="submit">
                        {operation === "save" ? "Saving…" : "Save details"}
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      role="tabpanel"
                      id="listing-panel"
                      aria-labelledby="listing-tab"
                      className="edit-fields"
                    >
                      <div className="price-estimate">
                        <span className="field-label">Suggested range</span>
                        <strong>{estimate || "More details needed"}</strong>
                        <p>
                          {item.price_basis ||
                            "Add a clear photo and object details to get an estimate."}
                        </p>
                        <small>
                          AI estimate, not market research. Check local prices
                          and condition before posting.
                        </small>
                      </div>
                      <label>
                        Listing title
                        <input
                          value={draft.listing_title}
                          placeholder={draft.name}
                          maxLength={160}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              listing_title: event.target.value,
                            })
                          }
                        />
                      </label>
                      <div className="field-pair">
                        <label>
                          Asking price
                          <input
                            type="number"
                            min="0"
                            max="1000000"
                            step="0.01"
                            placeholder={
                              estimate &&
                              item.price_low !== null &&
                              item.price_high !== null
                                ? String(
                                    Math.round(
                                      (item.price_low + item.price_high) / 2,
                                    ),
                                  )
                                : "Your price"
                            }
                            value={draft.asking_price ?? ""}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                asking_price:
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label>
                          Currency
                          <select
                            value={draft.currency}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                currency: event.target.value,
                                asking_price: null,
                              })
                            }
                          >
                            {["USD", "CAD", "GBP", "EUR", "AUD"].map(
                              (value) => (
                                <option key={value}>{value}</option>
                              ),
                            )}
                          </select>
                        </label>
                      </div>
                      <label>
                        Listing description
                        <textarea
                          value={draft.listing_body}
                          maxLength={4000}
                          rows={5}
                          placeholder="Describe the item, its condition, and pickup details."
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              listing_body: event.target.value,
                            })
                          }
                        />
                      </label>
                      <p className="field-help">
                        Review all details before posting. You choose where to
                        publish.
                      </p>
                      <div className="draft-actions">
                        <button
                          className="button primary"
                          type="button"
                          onClick={() => run(copy, "copy")}
                        >
                          <Copy size={16} />
                          {operation === "copy" ? "Copying…" : "Copy listing"}
                        </button>
                        <button
                          className="button outline"
                          type="button"
                          onClick={() => run(share, "share")}
                        >
                          <Share2 size={16} />
                          {operation === "share" ? "Sharing…" : "Share"}
                        </button>
                        <button className="text-button" type="submit">
                          {operation === "save" ? "Saving…" : "Save draft"}
                        </button>
                      </div>
                      {!demo && (
                        <a
                          className="text-button"
                          href={`/api/items/${item.id}/image${original ? "?original=1" : ""}`}
                          download
                        >
                          <Download size={15} />
                          {original
                            ? "Download original photo"
                            : "Download catalog photo"}
                        </a>
                      )}
                    </div>
                  )}
                </fieldset>
              </form>
              <div className="detail-feedback">
                {error ? (
                  <p className="error" role="alert" id="object-edit-error">
                    {error}
                  </p>
                ) : (
                  <p
                    role="status"
                    className={message ? "success" : "field-help"}
                  >
                    {busy
                      ? "Saving your changes…"
                      : message || (dirty ? "Unsaved changes" : "")}
                  </p>
                )}
              </div>
              <section
                className="disposition-section"
                aria-label="Choose a decision"
              >
                <div className="disposition-actions">
                  {decisions.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      disabled={busy || item.deleting}
                      aria-pressed={item.disposition === value}
                      onClick={(event) => decide(value, event.detail > 0)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
                {["sell", "donate", "toss"].includes(item.disposition) ? (
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={(event) => decide("active", event.detail > 0)}
                  >
                    <RotateCcw size={15} />
                    Return to collection
                  </button>
                ) : (
                  <p className="field-help">
                    Sell, Donate, or Toss records your decision and moves this
                    object to Archive. You can undo it.
                  </p>
                )}
              </section>
              {!demo && (
                <details className="remove-object">
                  <summary>Remove this object permanently</summary>
                  <p>
                    This deletes its photos, details, and sale draft. This
                    action cannot be undone.
                  </p>
                  <button
                    className="text-button danger"
                    disabled={busy}
                    onClick={() => run(onRemove, "remove")}
                  >
                    Permanently delete object
                  </button>
                </details>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      <Dialog.Root open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay discard-overlay" />
          <Dialog.Content
            className="discard-dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              closeButton.current?.focus();
            }}
          >
            <Dialog.Title>Discard your changes?</Dialog.Title>
            <Dialog.Description>
              Your edits have not been saved. Keep editing to save them, or
              discard them to close this object.
            </Dialog.Description>
            <div className="draft-actions">
              <button
                className="button primary"
                onClick={() => setConfirmDiscard(false)}
              >
                Keep editing
              </button>
              <button
                className="button outline danger"
                onClick={() => {
                  setConfirmDiscard(false);
                  onClose();
                }}
              >
                Discard changes
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  );
}
