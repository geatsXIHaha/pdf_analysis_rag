import type { Annotation, PdfDoc, SummaryResult } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Request failed");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export function getFileUrl(docId: string): string {
  return `${API_BASE}/api/docs/${docId}/file`;
}

export async function listDocs(): Promise<PdfDoc[]> {
  const data = await request<{ items: PdfDoc[] }>("/api/docs");
  return data.items;
}

export async function deleteDoc(docId: string): Promise<void> {
  await request(`/api/docs/${docId}`, { method: "DELETE" });
}

export async function uploadPdf(file: File): Promise<{ doc_id: string; summary: SummaryResult }> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: form
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Upload failed");
  }

  return response.json();
}

export async function getSummary(docId: string): Promise<SummaryResult> {
  return request<SummaryResult>(`/api/summary/${docId}`);
}

export async function sendChat(payload: {
  doc_id: string;
  message: string;
  session_id?: string | null;
}): Promise<{ answer: string; session_id: string; sources: { page: number; snippet: string }[] }> {
  return request("/api/chat", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function listAnnotations(docId: string): Promise<Annotation[]> {
  const data = await request<{ items: Annotation[] }>(`/api/annotations/${docId}`);
  return data.items;
}

export async function addAnnotation(payload: {
  doc_id: string;
  type: "pin";
  page: number;
  text: string;
  rect: { x: number; y: number; w: number; h: number };
}): Promise<Annotation[]> {
  const data = await request<{ items: Annotation[] }>("/api/annotations", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.items;
}

export async function deletePin(docId: string, annotationId: string): Promise<Annotation[]> {
  const data = await request<{ items: Annotation[] }>(
    `/api/annotations/${docId}/${annotationId}`,
    { method: "DELETE" }
  );
  return data.items;
}

export async function translateText(text: string): Promise<string> {
  const data = await request<{ translation: string }>("/api/translate", {
    method: "POST",
    body: JSON.stringify({ text })
  });
  return data.translation;
}
