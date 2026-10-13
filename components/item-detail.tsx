"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
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
  onAction: (value: Disposition) => Promise<void>;
  onRetry: () => Promise<void>;
  onRemove: () => Promise<void>;
  demo?: boolean;
}) {
  const [tab, setTab] = useState<"details" | "listing">("details");
  const [original, setOriginal] = useState(false);
  const [draft, setDraft] = useState<Edits>({
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
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const processing = item.processing_state === "processing";
  const money = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: draft.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  const estimate =
    item.price_low !== null &&
    item.price_high !== null &&
    draft.currency === item.currency
      ? `${money(item.price_low)}–${money(item.price_high)}`
      : null;
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const listing = () =>
    `${draft.listing_title || draft.name}\n${draft.asking_price !== null ? money(draft.asking_price) : "Price: open to offers"}\n\n${draft.listing_body || draft.description}`;
  async function copy() {
    await onSave(draft);
    await navigator.clipboard.writeText(listing());
    setMessage("Listing copied. Download the photo to include it.");
  }
  async function share() {
    await onSave(draft);
    if (navigator.share) {
      await navigator.share({
        title: draft.listing_title || draft.name,
        text: listing(),
      });
      setMessage("Listing shared.");
    } else await copy();
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="item-dialog"
          aria-describedby="object-dialog-description"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onRestoreFocus();
          }}
        >
          <button
            className="dialog-close icon-button"
            aria-label="Close object details"
            onClick={onClose}
            disabled={busy}
          >
            <X size={22} />
          </button>
          <div className="detail-visual">
            <div className="detail-photo">
              <ItemImage item={item} original={original} />
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
              <span>OBJECT IN YOUR COLLECTION</span>
              <span>{item.category}</span>
            </div>
          </div>
          <div className="detail-content">
            <div className="eyebrow">
              {demo ? "SAMPLE OBJECT" : "EVERYDAY ARCHIVE"}
            </div>
            <Dialog.Title className="detail-title">{item.name}</Dialog.Title>
            <Dialog.Description
              id="object-dialog-description"
              className="detail-description"
            >
              {item.description ||
                "Every object starts with a photo. Add its story below."}
            </Dialog.Description>
            {processing && (
              <p className="notice" role="status">
                Preparing your catalog photo and sale draft. You can close this
                view; processing continues.
              </p>
            )}
            {item.warning && (
              <div className="notice">
                <p>{item.warning}</p>
                {item.deleting ? (
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => run(onRemove)}
                  >
                    Retry removal
                  </button>
                ) : (
                  item.attempts < 3 && (
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => run(onRetry)}
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
                onClick={() => run(onRetry)}
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
                  await onSave(draft);
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
                            setDraft({ ...draft, location: event.target.value })
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
                          setDraft({ ...draft, condition: event.target.value })
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
                      Save details
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
                      <span className="eyebrow">SUGGESTED RANGE</span>
                      <strong>{estimate || "More details needed"}</strong>
                      <p>
                        {item.price_basis ||
                          "Add a clear photo and object details to get an estimate."}
                      </p>
                      <small>
                        AI estimate, not market research. Check local prices and
                        condition before posting.
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
                          {["USD", "CAD", "GBP", "EUR", "AUD"].map((value) => (
                            <option key={value}>{value}</option>
                          ))}
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
                        onClick={() => run(copy)}
                      >
                        <Copy size={16} />
                        Copy listing
                      </button>
                      <button
                        className="button outline"
                        type="button"
                        onClick={() => run(share)}
                      >
                        <Share2 size={16} />
                        Share
                      </button>
                      <button className="text-button" type="submit">
                        Save draft
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
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="success" role="status">
                {message}
              </p>
            )}
            <div className="disposition-section">
              <span className="eyebrow">WHAT COMES NEXT?</span>
              <div className="disposition-actions">
                <button
                  disabled={busy}
                  onClick={() => run(() => onAction("keep"))}
                >
                  <Check size={18} />
                  Keep
                </button>
                <button
                  disabled={busy}
                  onClick={() => run(() => onAction("sell"))}
                >
                  <Tag size={18} />
                  Sell
                </button>
                <button
                  disabled={busy}
                  onClick={() => run(() => onAction("donate"))}
                >
                  <HeartHandshake size={18} />
                  Donate
                </button>
                <button
                  disabled={busy}
                  onClick={() => run(() => onAction("toss"))}
                >
                  <Trash2 size={18} />
                  Toss
                </button>
              </div>
              {["sell", "donate", "toss"].includes(item.disposition) ? (
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => run(() => onAction("active"))}
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
            </div>
            <details className="remove-object">
              <summary>Remove this object permanently</summary>
              <p>
                This deletes its photos, details, and sale draft. This action
                cannot be undone.
              </p>
              <button
                className="text-button danger"
                disabled={busy}
                onClick={() => run(onRemove)}
              >
                Permanently delete object
              </button>
            </details>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
