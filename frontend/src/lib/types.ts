export type SummaryResult = {
  short_summary: string;
  detailed_summary: string;
  key_topics: string[];
  keywords: string[];
};

export type PdfDoc = {
  id: string;
  filename: string;
  pages: number;
  created_at: string;
};

export type Citation = {
  page: number;
  snippet: string;
  file?: string | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Annotation = {
  id: string;
  doc_id: string;
  type: "pin";
  page: number;
  text: string;
  rect: Rect;
  created_at: string;
};

export type Highlight = {
  id: string;
  page: number;
  text: string;
  rect: Rect;
};

export type SelectionInfo = {
  text: string;
  page: number;
  rect: Rect;
  menuX: number;
  menuY: number;
};
