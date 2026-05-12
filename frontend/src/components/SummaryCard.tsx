import type { SummaryResult } from "../lib/types";

export default function SummaryCard({ summary }: { summary: SummaryResult | null }) {
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
        <h4 className="font-semibold">Key Topics</h4>
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
      </div>
      <div className="mt-4 text-sm">
        <h4 className="font-semibold">Keywords</h4>
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
      </div>
      <div className="mt-4 text-sm">
        <h4 className="font-semibold">Detailed Summary</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {summary.detailed_summary}
        </p>
      </div>
    </div>
  );
}
