import { X } from "lucide-react";
export function Toast({
  message,
  onUndo,
  onClose,
}: {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="toast">
      <span role="status">{message}</span>
      {onUndo && <button onClick={onUndo}>Undo</button>}
      <button aria-label="Dismiss notification" onClick={onClose}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
