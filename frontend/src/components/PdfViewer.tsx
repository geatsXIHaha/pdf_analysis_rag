"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { Highlight, SelectionInfo } from "../lib/types";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PdfViewer({
  fileUrl,
  zoom,
  onZoomChange,
  onSelection,
  highlights,
  scrollToPage
}: {
  fileUrl: string | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onSelection: (selection: SelectionInfo | null) => void;
  highlights: Highlight[];
  scrollToPage?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef(new Map<number, HTMLDivElement>());
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    if (!fileUrl) {
      setNumPages(0);
    }
  }, [fileUrl]);

  useEffect(() => {
    if (!scrollToPage) {
      return;
    }
    const target = pageRefs.current.get(scrollToPage);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollToPage]);

  const findPageElement = (node: Node | null): HTMLElement | null => {
    let el = node instanceof HTMLElement ? node : node?.parentElement || null;
    while (el && !el.dataset.page) {
      el = el.parentElement;
    }
    return el;
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      onSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const container = containerRef.current;
    const pageEl = findPageElement(range.commonAncestorContainer);
    if (!container || !pageEl || !container.contains(range.commonAncestorContainer)) {
      onSelection(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const pageRect = pageEl.getBoundingClientRect();
    const menuX = rect.left + rect.width / 2;
    const menuY = rect.top - 40;

    if (rect.width === 0 || rect.height === 0) {
      onSelection(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      onSelection(null);
      return;
    }

    const page = Number(pageEl.dataset.page || 1);

    onSelection({
      text,
      page,
      rect: {
        x: (rect.left - pageRect.left) / pageRect.width,
        y: (rect.top - pageRect.top) / pageRect.height,
        w: rect.width / pageRect.width,
        h: rect.height / pageRect.height
      },
      menuX,
      menuY
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="text-sm text-muted">Pages {numPages || "-"}</div>
        <div className="flex items-center gap-2 text-sm">
          <button
            className="rounded-full border border-border px-3 py-1"
            onClick={() => onZoomChange(Math.max(0.6, zoom - 0.1))}
          >
            -
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            className="rounded-full border border-border px-3 py-1"
            onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative mt-4 flex flex-1 items-start justify-center overflow-auto"
        onMouseUp={handleMouseUp}
      >
        {!fileUrl && (
          <div className="text-sm text-muted">Select a PDF to preview.</div>
        )}
        {fileUrl && (
            <Document
              key={fileUrl}
              file={fileUrl}
              onLoadSuccess={(doc) => setNumPages(doc.numPages)}
            >
              {Array.from({ length: numPages }, (_, index) => {
                const page = index + 1;
                const pageHighlights = (highlights || []).filter((item) => item.page === page);
                return (
                  <div
                    key={page}
                    ref={(node) => {
                      if (node) {
                        pageRefs.current.set(page, node);
                      }
                    }}
                    data-page={page}
                    className="relative mb-6 flex justify-center"
                  >
                    <div className="relative">
                      <Page
                        pageNumber={page}
                        scale={zoom}
                        renderAnnotationLayer
                        renderTextLayer
                      />
                      {pageHighlights.map((item) => (
                        <div
                          key={item.id}
                          className="absolute bg-accent/25"
                          style={{
                            left: `${item.rect.x * 100}%`,
                            top: `${item.rect.y * 100}%`,
                            width: `${item.rect.w * 100}%`,
                            height: `${item.rect.h * 100}%`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </Document>
        )}
      </div>
    </div>
  );
}
