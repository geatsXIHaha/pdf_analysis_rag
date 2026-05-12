import { useState } from "react";
import type { SummaryResult } from "../lib/types";

export default function SummaryCard({ summary }: { summary: SummaryResult | null }) {
  const [showDetailedSummary, setShowDetailedSummary] = useState(false);
  const [showKeyTopics, setShowKeyTopics] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  if (!summary) {
    return (
      <div className="panel rounded-2xl p-4 shadow-glow">
        <h3 className="text-sm font-semibold">Summary</h3>
        <p className="mt-2 text-sm text-muted">Upload a PDF to see its summary.</p>
      </div>
    );
  }

  return (
    <div className="panel rounded-2xl p-4 shadow-glow">
      <h3 className="text-sm font-semibold">Summary</h3>
      <p className="mt-2 text-sm leading-relaxed">{summary.short_summary}</p>
      <div className="mt-4 text-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Key Topics</h4>
          <button
            type="button"
            className="text-xs font-semibold text-accent"
            onClick={() => setShowKeyTopics((prev) => !prev)}
          >
            {showKeyTopics ? "Collapse" : "Expand"}
          </button>
        </div>
        <div
          className={`transition-all duration-300 ${
            showKeyTopics ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          {summary.key_topics.length === 0 ? (
            <p className="mt-2 text-xs text-muted">No key topics available.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.key_topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-border px-3 py-1 text-xs"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 text-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Keywords</h4>
          <button
            type="button"
            className="text-xs font-semibold text-accent"
            onClick={() => setShowKeywords((prev) => !prev)}
          >
            {showKeywords ? "Collapse" : "Expand"}
          </button>
        </div>
        <div
          className={`transition-all duration-300 ${
            showKeywords ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          {summary.keywords.length === 0 ? (
            <p className="mt-2 text-xs text-muted">No keywords available.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-border px-3 py-1 text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 text-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Detailed Summary</h4>
          <button
            type="button"
            className="text-xs font-semibold text-accent"
            onClick={() => setShowDetailedSummary((prev) => !prev)}
          >
            {showDetailedSummary ? "Collapse" : "Expand"}
          </button>
        </div>
        <div
          className={`transition-all duration-300 ${
            showDetailedSummary ? "max-h-80 opacity-100" : "max-h-10 opacity-80"
          } overflow-hidden`}
        >
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {summary.detailed_summary}
          </p>
        </div>
      </div>
    </div>
  );
}
