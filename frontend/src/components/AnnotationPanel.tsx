import type { Annotation } from "../lib/types";

export default function AnnotationPanel({
  items,
  onJump,
  onDelete
}: {
  items: Annotation[];
  onJump: (page: number) => void;
  onDelete: (annotationId: string) => void;
}) {
  return (
    <div className="panel rounded-2xl p-4 shadow-glow">
      <h3 className="text-sm font-semibold">Annotations</h3>
      <div className="mt-3 space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted">No pins yet.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="block w-full rounded-xl border border-border px-3 py-2 text-left text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <button onClick={() => onJump(item.page)} className="text-left">
                <div className="text-xs uppercase text-muted">Pin</div>
                <div className="text-sm font-semibold">Page {item.page}</div>
                <div className="mt-1 max-h-10 overflow-hidden text-ellipsis text-xs text-muted">
                  {item.text}
                </div>
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="flex-shrink-0 rounded-full border border-border px-2 py-1 text-xs text-muted"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
