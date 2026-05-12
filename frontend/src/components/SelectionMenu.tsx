import type { SelectionInfo } from "../lib/types";

export default function SelectionMenu({
  selection,
  onHighlight,
  onUnhighlight,
  canUnhighlight,
  onPin,
  onTranslate,
  onClose
}: {
  selection: SelectionInfo | null;
  onHighlight: () => void;
  onUnhighlight: () => void;
  canUnhighlight: boolean;
  onPin: () => void;
  onTranslate: () => void;
  onClose: () => void;
}) {
  if (!selection) {
    return null;
  }

  return (
    <div
      className="panel fixed z-50 flex items-center gap-2 rounded-full px-3 py-2 text-xs shadow-glow"
      style={{ left: selection.menuX, top: selection.menuY, transform: "translateX(-50%)" }}
    >
      {canUnhighlight ? (
        <button className="font-semibold text-accent" onClick={onUnhighlight}>
          Unhighlight
        </button>
      ) : (
        <button className="font-semibold text-accent" onClick={onHighlight}>
          Highlight
        </button>
      )}
      <button className="font-semibold text-accent-2" onClick={onPin}>
        Pin
      </button>
      <button className="font-semibold" onClick={onTranslate}>
        Translate
      </button>
      <button className="text-muted" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
