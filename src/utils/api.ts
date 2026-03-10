const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

// Types for responses
export interface UploadResponse {
  filename: string;
  chunks_created: number;
}

export interface AskResponse {
  answer: string;
}

function buildApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

async function parseErrorResponse(res: Response, fallbackMessage: string): Promise<string> {
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
 * Upload a file to the backend
 * @param file File object
 * @returns UploadResponse
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  console.log("Uploading file:", file.name, "size:", file.size);

  try {
    const res = await fetch(buildApiUrl("/upload"), {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const message = await parseErrorResponse(res, res.statusText || "Request failed");
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
 * Ask a question to the backend agent
 * @param question string
 * @returns AskResponse
 */
export async function askQuestion(question: string): Promise<AskResponse> {
  const encodedQuestion = encodeURIComponent(question);

  const res = await fetch(`${API_URL}/ask?question=${encodedQuestion}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Question failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

