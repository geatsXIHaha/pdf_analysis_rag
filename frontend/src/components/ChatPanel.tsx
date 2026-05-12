"use client";

import { useState } from "react";
import type { ChatMessage } from "../lib/types";
import LoadingDots from "./LoadingDots";
import Markdown from "./Markdown";

export default function ChatPanel({
  messages,
  loading,
  onSend,
  disabled
}: {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="panel flex h-full flex-col rounded-2xl shadow-glow">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Chat</h3>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-sm text-muted">Ask a question about the PDF.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-bubble px-3 py-2 text-sm ${
              message.role === "user"
                ? "ml-6 bg-accent/10"
                : "mr-6 border border-border"
            }`}
          >
            {message.role === "assistant" ? (
              <Markdown content={message.content} />
            ) : (
              <p>{message.content}</p>
            )}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-2 text-xs text-muted">
                Sources: {message.citations.map((c) => `p.${c.page}`).join(", ")}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble mr-6 border border-border px-3 py-2 text-sm">
            <LoadingDots />
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="flex-1 rounded-xl border border-border bg-transparent px-3 py-2 text-sm"
            placeholder="Ask about the PDF"
            disabled={disabled || loading}
          />
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
            disabled={loading || disabled}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
