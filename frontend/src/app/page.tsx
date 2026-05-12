"use client";

import { useEffect, useMemo, useState } from "react";
import AnnotationPanel from "../components/AnnotationPanel";
import ChatPanel from "../components/ChatPanel";
import PdfViewer from "../components/PdfViewer";
import SelectionMenu from "../components/SelectionMenu";
import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import ThemeToggle from "../components/ThemeToggle";
import {
  addAnnotation,
  deleteDoc,
  deletePin,
  getFileUrl,
  getSummary,
  listAnnotations,
  listDocs,
  sendChat,
  translateText,
  uploadPdf,
  uploadPdfBatch
} from "../lib/api";
import type {
  Annotation,
  ChatMessage,
  Highlight,
  PdfDoc,
  SelectionInfo,
  SummaryResult
} from "../lib/types";

export default function HomePage() {
  const [docs, setDocs] = useState<PdfDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<PdfDoc | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [searchAll, setSearchAll] = useState(true);
  const [strictMode, setStrictMode] = useState(true);

  useEffect(() => {
    listDocs().then(setDocs).catch(() => setDocs([]));
  }, []);

  useEffect(() => {
    if (!selectedDoc) {
      setSummary(null);
      setAnnotations([]);
      setHighlights([]);
      setMessages([]);
      setSessionId(null);
      setPageNumber(1);
      setSelection(null);
      setTranslation(null);
      return;
    }

    getSummary(selectedDoc.id)
      .then(setSummary)
      .catch(() => setSummary(null));
    listAnnotations(selectedDoc.id)
      .then(setAnnotations)
      .catch(() => setAnnotations([]));
    setHighlights([]);
    setMessages([]);
    setSessionId(null);
    setPageNumber(1);
    setSelection(null);
    setTranslation(null);
  }, [selectedDoc]);

  const fileUrl = useMemo(() => {
    return selectedDoc ? getFileUrl(selectedDoc.id) : null;
  }, [selectedDoc]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await uploadPdf(file);
      const updatedDocs = await listDocs();
      setDocs(updatedDocs);
      const matched = updatedDocs.find((doc) => doc.id === response.doc_id) || null;
      setSelectedDoc(matched);
      setSummary(response.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadBatch = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    setUploading(true);
    try {
      const responses = await uploadPdfBatch(files);
      const updatedDocs = await listDocs();
      setDocs(updatedDocs);
      if (!selectedDoc && responses.length > 0) {
        const matched = updatedDocs.find((doc) => doc.id === responses[0].doc_id) || null;
        setSelectedDoc(matched);
        if (responses[0]?.summary) {
          setSummary(responses[0].summary);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (message: string) => {
    if (!selectedDoc) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);

    try {
      const response = await sendChat({
        doc_id: searchAll ? null : selectedDoc.id,
        message,
        session_id: sessionId,
        strict_mode: strictMode
      });
      setSessionId(response.session_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: response.answer,
          citations: response.sources
        }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveAnnotation = async (type: "highlight" | "pin") => {
    if (!selection || !selectedDoc) {
      return;
    }
    if (type === "pin") {
      const updated = await addAnnotation({
        doc_id: selectedDoc.id,
        type: "pin",
        page: selection.page,
        text: selection.text,
        rect: selection.rect
      });
      setAnnotations(updated);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      return;
    }

    const existing = findHighlightIndex(selection);
    if (existing !== -1) {
      setSelection(null);
      return;
    }

    const highlight: Highlight = {
      id: `${Date.now()}-hl`,
      page: selection.page,
      text: selection.text,
      rect: selection.rect
    };
    setHighlights((prev) => [...prev, highlight]);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const findHighlightIndex = (selection: SelectionInfo) => {
    return highlights.findIndex(
      (item) =>
        item.page === selection.page &&
        item.text === selection.text &&
        Math.abs(item.rect.x - selection.rect.x) < 0.01 &&
        Math.abs(item.rect.y - selection.rect.y) < 0.01
    );
  };

  const handleUnhighlight = () => {
    if (!selection) {
      return;
    }
    const index = findHighlightIndex(selection);
    if (index === -1) {
      return;
    }
    setHighlights((prev) => prev.filter((_, idx) => idx !== index));
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleTranslate = async () => {
    const text = window.getSelection()?.toString().trim() || "";
    if (!text) {
      setTranslateError("Please select text to translate.");
      return;
    }
    console.log("[translate] selectedText", text);
    setTranslateLoading(true);
    setTranslateError(null);
    try {
      const result = await translateText(text, "zh-CN");
      setTranslation(result);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error(error);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    } finally {
      setTranslateLoading(false);
    }
  };

  const handleDelete = async (doc: PdfDoc) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${doc.filename}"? This cannot be undone.`
    );
    if (!confirmDelete) {
      return;
    }
    try {
      await deleteDoc(doc.id);
      const updated = await listDocs();
      setDocs(updated);
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
        setSummary(null);
        setAnnotations([]);
        setHighlights([]);
        setMessages([]);
        setSessionId(null);
        setSelection(null);
        setTranslation(null);
        setPageNumber(1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePin = async (annotationId: string) => {
    if (!selectedDoc) {
      return;
    }
    try {
      const updated = await deletePin(selectedDoc.id, annotationId);
      setAnnotations(updated);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="app-shell min-h-screen px-4 pb-8 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">PDF Assistant</h1>
          <p className="text-sm text-muted">
            Upload PDFs, ask questions, and extract insights instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="panel flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-glow">
            <span>{uploading ? "Uploading..." : "Upload PDF Files"}</span>
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                if (files.length > 0) {
                  handleUploadBatch(files);
                }
                event.target.value = "";
              }}
              disabled={uploading}
            />
          </label>
          <ThemeToggle />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_360px]">
        <div className="h-[70vh]">
          <Sidebar
            docs={docs}
            selectedId={selectedDoc?.id}
            onSelect={setSelectedDoc}
            onUpload={handleUpload}
            uploading={uploading}
            onDelete={handleDelete}
          />
        </div>

        <div className="panel relative h-[70vh] rounded-2xl p-4 shadow-glow resize-panel">
          <SelectionMenu
            selection={selection}
            onHighlight={() => handleSaveAnnotation("highlight")}
            onUnhighlight={handleUnhighlight}
            canUnhighlight={selection ? findHighlightIndex(selection) !== -1 : false}
            onPin={() => handleSaveAnnotation("pin")}
            onTranslate={handleTranslate}
            onClose={() => setSelection(null)}
          />
          <PdfViewer
            fileUrl={fileUrl}
            zoom={zoom}
            onZoomChange={setZoom}
            onSelection={setSelection}
            highlights={highlights}
            scrollToPage={pageNumber}
          />
        </div>

        <div className="flex h-[70vh] flex-col gap-4">
          <SummaryCard summary={summary} />
          <div className="flex-1">
            <ChatPanel
              messages={messages}
              loading={chatLoading}
              onSend={handleSend}
              disabled={docs.length === 0 || (!searchAll && !selectedDoc)}
              searchAll={searchAll}
              onToggleSearchAll={() => setSearchAll((prev) => !prev)}
              strictMode={strictMode}
              onToggleStrictMode={() => setStrictMode((prev) => !prev)}
            />
          </div>
          <AnnotationPanel
            items={annotations}
            onJump={setPageNumber}
            onDelete={handleDeletePin}
          />
        </div>
      </div>

      {translation && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-6">
          <div className="panel w-full max-w-lg rounded-2xl p-6 shadow-glow">
            <h3 className="text-sm font-semibold">Translation</h3>
            <p className="mt-3 text-sm leading-relaxed">{translation}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setTranslation(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {translateLoading && (
        <div className="fixed bottom-6 right-6 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
          Translating...
        </div>
      )}

      {translateError && (
        <div className="fixed bottom-6 right-6 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
          {translateError}
        </div>
      )}
    </div>
  );
}
