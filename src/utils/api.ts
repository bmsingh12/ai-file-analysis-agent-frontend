import { AskResponse } from "@/app/lib/AskResponse";
import { UploadResponse } from "@/app/lib/UploadResponse";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

function buildApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

async function parseErrorResponse(
  res: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = await res.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }
  } catch {}

  return fallbackMessage;
}

export interface CreateSessionResponse {
  session_id: string;
}

export interface AskQuestionRequest {
  session_id: string;
  question: string;
}

export async function createSession(): Promise<CreateSessionResponse> {
  try {
    const res = await fetch(buildApiUrl("/chat/session"), {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const message = await parseErrorResponse(
        res,
        res.statusText || "Request failed",
      );
      throw new Error(`Create session failed: ${message}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Create session failed: ${error.message}`);
    }

    throw new Error("Create session failed: Unable to reach the API server.");
  }
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(buildApiUrl("/upload"), {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const message = await parseErrorResponse(
        res,
        res.statusText || "Request failed",
      );
      throw new Error(`Upload failed: ${message}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    throw new Error("Upload failed: Unable to reach the API server.");
  }
}

export async function askQuestion(
  payload: AskQuestionRequest,
): Promise<AskResponse> {
  try {
    const res = await fetch(buildApiUrl("/ask"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const message = await parseErrorResponse(
        res,
        res.statusText || "Request failed",
      );
      throw new Error(`Question failed: ${message}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Question failed: ${error.message}`);
    }

    throw new Error("Question failed: Unable to reach the API server.");
  }
}

export interface StreamTokenEvent {
  type: "token";
  content: string;
}

export interface StreamDoneEvent extends AskResponse {
  type: "done";
}

export interface StreamErrorEvent {
  type: "error";
  detail: string;
}

export type AskStreamEvent =
  | StreamTokenEvent
  | StreamDoneEvent
  | StreamErrorEvent;

export async function streamAskQuestion(
  payload: AskQuestionRequest,
  onEvent: (event: AskStreamEvent) => void,
): Promise<void> {
  const res = await fetch(buildApiUrl("/ask/stream"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await parseErrorResponse(
      res,
      res.statusText || "Request failed",
    );
    throw new Error(`Question failed: ${message}`);
  }

  if (!res.body) {
    throw new Error("Streaming not supported by this browser.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const eventChunk of events) {
      const line = eventChunk
        .split("\n")
        .find((entry) => entry.startsWith("data: "));

      if (!line) {
        continue;
      }

      const rawJson = line.replace(/^data:\s*/, "");

      try {
        const parsed = JSON.parse(rawJson) as AskStreamEvent;
        onEvent(parsed);
      } catch {
        // ignore malformed chunk
      }
    }
  }
}
