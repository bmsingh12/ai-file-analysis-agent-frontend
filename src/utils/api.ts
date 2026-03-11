import { AskQuestionRequest } from "@/app/lib/AskQuestionRequest";
import { AskResponse } from "@/app/lib/AskResponse";
import { CreateSessionResponse } from "@/app/lib/CreateSessionResponse";
import { UploadResponse } from "@/app/lib/UploadResponse";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

function buildApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

async function parseErrorResponse(
  res: Response,
  fallbackMessage: string
): Promise<string> {
  try {
    const data = await res.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }
  } catch {
    // Ignore non-JSON error bodies and fall back to the HTTP status text.
  }

  return fallbackMessage;
}

/**
 * Create a new chat session
 */
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
        res.statusText || "Request failed"
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

/**
 * Upload a file to the backend
 */
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
        res.statusText || "Request failed"
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

/**
 * Ask a question using the current chat session
 */
export async function askQuestion(
  payload: AskQuestionRequest
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
        res.statusText || "Request failed"
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