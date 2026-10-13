"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowUpRight,
  Grid2X2,
  Grid3X3,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { sampleItems, type DisplayItem } from "@/lib/sample";
import {
  categories,
  dispositionLabels,
  type Disposition,
  type InventoryItem,
  type GridItem,
} from "@/types";
import { ItemImage } from "./item-image";
import { ItemDetail } from "./item-detail";
import { Toast } from "./toast";
type Summary = Pick<InventoryItem, "id" | "disposition" | "processing_state">;
type Response = { items: GridItem[]; total: number; summary: Summary[] };
const archived = (item: { disposition: Disposition }) =>
  ["sell", "donate", "toss"].includes(item.disposition);
export function Collection({
  archive = false,
  demo = false,
}: {
  archive?: boolean;
  demo?: boolean;
}) {
  const [items, setItems] = useState<GridItem[]>(demo ? sampleItems : []);
  const [summary, setSummary] = useState<Summary[]>(demo ? sampleItems : []);
  const [total, setTotal] = useState(demo ? 9 : 0);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [disposition, setDisposition] = useState("");
  const [dense, setDense] = useState(false);
  const [selected, setSelected] = useState<DisplayItem | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [offset, setOffset] = useState(0);
  const [demoArchive, setDemoArchive] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const selectedId = useRef<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const searchInput = useRef<HTMLInputElement | null>(null);
  const [poof, setPoof] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    undo?: { id: string; disposition: Disposition };
  } | null>(null);
  const transition = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showArchive = archive || demoArchive;
  useEffect(
    () => () => {
      if (transition.current) clearTimeout(transition.current);
    },
    [],
  );
  useEffect(() => {
    if (demo) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    async function load() {
      const params = new URLSearchParams({
        archive: archive ? "1" : "0",
        search,
        category,
        disposition,
        offset: String(offset),
      });
      try {
        const data = await api<Response>(`/api/items?${params}`, {
          signal: controller.signal,
        });
        if (!alive) return;
        setItems(data.items);
        if (selectedId.current) {
          const id = selectedId.current;
          const detail = await api<{ item: InventoryItem }>(
            `/api/items/${id}`,
            { signal: controller.signal },
          );
          if (alive && selectedId.current === id) setSelected(detail.item);
        }
        setTotal(data.total);
        setSummary(data.summary);
        setError("");
        setLoading(false);
        timer = setTimeout(
          load,
          data.summary.some((item) => item.processing_state === "processing")
            ? 4000
            : 60000,
        );
      } catch (error) {
        if (alive) {
          setError(
            error instanceof Error
              ? error.message
              : "Could not load your collection.",
          );
          setLoading(false);
        }
      }
    }
    const initial = setTimeout(load, search ? 200 : 0);
    return () => {
      alive = false;
      controller.abort();
      clearTimeout(timer);
      clearTimeout(initial);
    };
  }, [archive, demo, search, category, disposition, refresh, offset]);
  const visible = demo
    ? items.filter(
        (item) =>
          (archived(item) === showArchive || poof === item.id) &&
          (!category || item.category === category) &&
          (!disposition || item.disposition === disposition) &&
          `${item.name} ${(item as DisplayItem).description} ${item.location}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : items;
  const collected = summary.filter((item) => !archived(item)).length;
  const released = summary.length - collected;
  const kept = summary.filter((item) => item.disposition === "keep").length;
  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setOffset(0);
  }
  async function update(id: string, changes: Partial<InventoryItem>) {
    let updated: DisplayItem;
    if (demo)
      updated = {
        ...items.find((item) => item.id === id)!,
        ...changes,
      } as DisplayItem;
    else
      updated = (
        await api<{ item: InventoryItem }>(`/api/items/${id}`, {
          method: "PATCH",
          body: JSON.stringify(changes),
        })
      ).item;
    setItems((previous) =>
      previous.map((item) => (item.id === id ? updated : item)),
    );
    const before = summary.find((item) => item.id === id);
    if (!demo && before && archived(before) !== archived(updated))
      setTotal((value) =>
        Math.max(0, value + (archived(updated) === showArchive ? 1 : -1)),
      );
    setSummary((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              id: item.id,
              disposition: updated.disposition,
              processing_state: updated.processing_state,
            }
          : item,
      ),
    );
    setSelected((previous) => (previous?.id === id ? updated : previous));
    return updated;
  }
  function close() {
    selectedId.current = null;
    setSelected(null);
  }
  async function open(item: GridItem) {
    setOpening(item.id);
    try {
      const detail = demo
        ? (item as DisplayItem)
        : (await api<{ item: InventoryItem }>(`/api/items/${item.id}`)).item;
      selectedId.current = item.id;
      setSelected(detail);
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Could not open this object.",
      });
    } finally {
      setOpening(null);
    }
  }
  async function action(value: Disposition) {
    if (!selected) return;
    const before = selected;
    await update(before.id, { disposition: value });
    const removes = archived({ disposition: value }) !== showArchive;
    if (removes) opener.current = null;
    close();
    if (removes) {
      setPoof(before.id);
      transition.current = setTimeout(
        () => {
          setPoof(null);
          if (!demo)
            setItems((previous) =>
              previous.filter((item) => item.id !== before.id),
            );
          setRefresh((value) => value + 1);
        },
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600,
      );
    } else setRefresh((value) => value + 1);
    setToast({
      message:
        value === "active"
          ? "Returned to your collection."
          : value === "keep"
            ? "A keeper. Nice choice."
            : `Marked to ${value}. A little lighter.`,
      undo: { id: before.id, disposition: before.disposition },
    });
  }
  async function undo() {
    if (!toast?.undo) return;
    try {
      await update(toast.undo.id, { disposition: toast.undo.disposition });
      setRefresh((value) => value + 1);
      setToast({ message: "Decision undone." });
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Could not undo. Please try again.",
      });
    }
  }
  return (
    <>
      <section className="collection-heading">
        <div>
          <div className="eyebrow">
            {demo
              ? "A GLIMPSE OF SOMETHING LIGHTER"
              : showArchive
                ? "THE THINGS YOU’RE READY TO RELEASE"
                : "A LITTLE LESS, A LITTLE LIGHTER"}
          </div>
          <h1>
            {showArchive
              ? "Room for what’s next."
              : "Your everyday,\ncollected."}
          </h1>
          <p>
            {showArchive
              ? "A record of your decisions. Bring anything back, anytime."
              : "See what you have. Keep what matters. Let the rest find its next chapter."}
          </p>
        </div>
        <div className="collection-stats">
          <div>
            <strong>{collected.toString().padStart(2, "0")}</strong>
            <span>in your collection</span>
          </div>
          <div>
            <strong>{showArchive ? released : kept}</strong>
            <span>{showArchive ? "ready to release" : "chosen to keep"}</span>
          </div>
        </div>
      </section>
      {demo && (
        <div className="demo-tabs">
          <button
            className={!showArchive ? "current" : ""}
            onClick={() => setDemoArchive(false)}
          >
            Collection ({collected})
          </button>
          <button
            className={showArchive ? "current" : ""}
            onClick={() => setDemoArchive(true)}
          >
            Archive ({released})
          </button>
        </div>
      )}
      <div className="collection-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search objects"
            ref={searchInput}
            placeholder="Find something in your collection…"
            value={search}
            onChange={(event) => changeFilter(setSearch, event.target.value)}
          />
        </label>
        <div className="toolbar-filters">
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => changeFilter(setCategory, event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          {showArchive ? (
            <select
              aria-label="Filter by decision"
              value={disposition}
              onChange={(event) =>
                changeFilter(setDisposition, event.target.value)
              }
            >
              <option value="">All decisions</option>
              {(["sell", "donate", "toss"] as Disposition[]).map((value) => (
                <option value={value} key={value}>
                  {dispositionLabels[value]}
                </option>
              ))}
            </select>
          ) : (
            <select
              aria-label="Filter by decision"
              value={disposition}
              onChange={(event) =>
                changeFilter(setDisposition, event.target.value)
              }
            >
              <option value="">All objects</option>
              <option value="active">Undecided</option>
              <option value="keep">Keepers</option>
            </select>
          )}
          <div className="density-toggle">
            <button
              aria-label="Comfortable grid"
              aria-pressed={!dense}
              onClick={() => setDense(false)}
            >
              <Grid2X2 size={18} />
            </button>
            <button
              aria-label="Compact grid"
              aria-pressed={dense}
              onClick={() => setDense(true)}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="collection-meta">
        <span>
          {loading
            ? "OPENING YOUR COLLECTION"
            : `${demo ? visible.length : total} ${demo ? (visible.length === 1 ? "OBJECT" : "OBJECTS") : total === 1 ? "OBJECT" : "OBJECTS"}${search ? " FOUND" : ""}`}
        </span>
        <span>
          {showArchive
            ? "A RECORD OF YOUR NEXT CHAPTERS"
            : "ONE PHOTO. ONE OBJECT. ONE SMALL START."}
        </span>
      </div>
      {error && (
        <div className="error-panel" role="alert">
          <p>{error}</p>
          <button
            className="button outline"
            onClick={() => setRefresh((value) => value + 1)}
          >
            <RotateCcw size={16} />
            Try again
          </button>
          <Link href="/sign-in">Sign in</Link>
        </div>
      )}
      {loading ? (
        <div className="object-grid" aria-label="Loading objects">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="skeleton-object" key={index} />
          ))}
        </div>
      ) : !error && visible.length === 0 ? (
        <section className="empty-state">
          <span className="empty-symbol" aria-hidden="true">
            ✳
          </span>
          <h2>
            {search || category || disposition
              ? "Nothing here just yet."
              : showArchive
                ? "Every decision starts\nwith a little space."
                : "Start with what’s\nin front of you."}
          </h2>
          <p>
            {search || category || disposition
              ? "Try another search or clear your filters."
              : showArchive
                ? "Choose Sell, Donate, or Toss from your collection. Your objects will be here, and you can bring them back."
                : "A mug. A favorite sweater. That thing in the drawer. Take a photo and begin your collection."}
          </p>
          {search || category || disposition ? (
            <button
              className="button outline"
              onClick={() => {
                setSearch("");
                setCategory("");
                setDisposition("");
                setOffset(0);
              }}
            >
              Clear filters
            </button>
          ) : (
            <Link
              className="button primary"
              href={showArchive ? "/gallery" : "/upload"}
            >
              {showArchive ? "Back to collection" : "Add your first photos"}
              <ArrowRight size={18} />
            </Link>
          )}
        </section>
      ) : (
        <div className={`object-grid ${dense ? "dense" : ""}`}>
          {visible.map((item, index) => (
            <button
              className={`object-tile ${poof === item.id ? "poofing" : ""}`}
              key={item.id}
              onClick={(event) => {
                opener.current = event.currentTarget;
                open(item);
              }}
              disabled={opening !== null}
              aria-busy={opening === item.id}
              aria-label={`Open ${item.name}`}
            >
              <div className="object-image">
                <ItemImage item={item} />
                {poof === item.id && (
                  <div className="poof-cloud" aria-hidden="true">
                    {Array.from({ length: 12 }, (_, index) => (
                      <i
                        key={index}
                        style={
                          {
                            "--x": `${Math.cos((index * Math.PI) / 6) * 110}px`,
                            "--y": `${Math.sin((index * Math.PI) / 6) * 110}px`,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </div>
                )}
                <span className="object-number">
                  {String(index + 1).padStart(3, "0")}
                </span>
                <span className="object-open" aria-hidden="true">
                  <ArrowUpRight size={19} />
                </span>
                {item.disposition !== "active" && (
                  <span className={`decision-badge ${item.disposition}`}>
                    {dispositionLabels[item.disposition]}
                  </span>
                )}
                {(item.processing_state !== "ready" || item.warning) && (
                  <span className="processing-badge">
                    {item.processing_state === "processing"
                      ? "Preparing…"
                      : item.processing_state === "uploaded"
                        ? "Finish upload"
                        : item.processing_state === "ready"
                          ? "Needs review"
                          : "Retry available"}
                  </span>
                )}
              </div>
              <div className="object-label">
                <h2>{item.name}</h2>
                <span>
                  {item.category}
                  {item.location ? ` · ${item.location}` : ""}
                </span>
              </div>
            </button>
          ))}
          {!showArchive && !search && !category && !disposition && (
            <Link
              href={demo ? "/sign-in" : "/upload"}
              className="add-object-tile"
            >
              <Plus size={27} />
              <span>{demo ? "Start your own" : "One more object"}</span>
              <small>A small step toward less.</small>
            </Link>
          )}
        </div>
      )}
      {!demo && items.length < total && !loading && (
        <div className="load-more">
          <button
            className="button outline"
            onClick={() => setOffset((value) => value + 100)}
          >
            Show more objects
          </button>
        </div>
      )}
      {selected && (
        <ItemDetail
          key={`${selected.id}:${selected.processing_state}`}
          item={selected}
          demo={demo}
          onClose={close}
          onRestoreFocus={() => {
            (opener.current?.isConnected
              ? opener.current
              : searchInput.current
            )?.focus();
          }}
          onSave={async (changes) => {
            await update(selected.id, changes);
            if (!demo) setRefresh((value) => value + 1);
          }}
          onAction={action}
          onRemove={async () => {
            if (demo) {
              setItems((previous) =>
                previous.filter((item) => item.id !== selected.id),
              );
              setSummary((previous) =>
                previous.filter((item) => item.id !== selected.id),
              );
            } else {
              await api(`/api/items/${selected.id}`, {
                method: "DELETE",
                body: JSON.stringify({ confirmation: selected.id }),
              });
              setRefresh((value) => value + 1);
            }
            opener.current = null;
            close();
            setToast({ message: "Object removed." });
          }}
          onRetry={async () => {
            await api(`/api/items/${selected.id}/process`, { method: "POST" });
            setRefresh((value) => value + 1);
            close();
            setToast({ message: "Processing started. Your photo is safe." });
          }}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.undo ? undo : undefined}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
