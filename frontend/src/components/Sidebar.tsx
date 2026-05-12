"use client";

import type { PdfDoc } from "../lib/types";
import { formatDate } from "../lib/utils";

export default function Sidebar({
  docs,
  selectedId,
  onSelect,
  onUpload,
  uploading,
  onDelete
}: {
  docs: PdfDoc[];
  selectedId?: string | null;
  onSelect: (doc: PdfDoc) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
  onDelete: (doc: PdfDoc) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <label className="panel flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium shadow-glow">
        <span>{uploading ? "Uploading..." : "Upload PDF"}</span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
              event.target.value = "";
            }
          }}
          disabled={uploading}
        />
      </label>

      <div className="panel flex-1 overflow-y-auto overflow-x-hidden rounded-2xl p-3 scrollbar-thin">
        <h3 className="text-xs uppercase tracking-wide text-muted">Documents</h3>
        <div className="mt-3 flex flex-col gap-2">
          {docs.length === 0 && (
            <p className="text-sm text-muted">No PDFs uploaded yet.</p>
          )}
          {docs.map((doc) => {
            const active = doc.id === selectedId;
            return (
              <div
                key={doc.id}
                className={`text-left rounded-xl border px-3 py-2 transition ${
                  active
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => onSelect(doc)}
                    className="min-w-0 flex-1 text-left"
                    type="button"
                  >
                    <div className="truncate text-sm font-semibold">{doc.filename}</div>
                    <div className="text-xs text-muted">{doc.pages} pages</div>
                    <div className="text-xs text-muted">{formatDate(doc.created_at)}</div>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(doc);
                    }}
                    className="flex-shrink-0 rounded-full border border-border px-2 py-1 text-xs text-muted"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
