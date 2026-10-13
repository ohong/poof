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
    <div className="toast" role="status">
      <span>{message}</span>
      {onUndo && <button onClick={onUndo}>Undo</button>}
      <button aria-label="Dismiss notification" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
