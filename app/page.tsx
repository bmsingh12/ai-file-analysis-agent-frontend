"use client";

import { createSession, streamAskQuestion, uploadFile } from "../src/utils/api";
import type { ChatMessage } from "@/app/lib/ChatMessage";
import type { UploadResponse } from "@/app/lib/UploadResponse";
import type { SourceCitation } from "@/app/lib/SourceCitation";
import { FileUploadSection } from "@/src/components/FileUploadSection";
import { SourceCitations } from "@/src/components/SourceCitations";
import { useEffect, useRef, useState } from "react";
import type { ChangeEventHandler, FormEventHandler } from "react";
import dynamic from "next/dynamic";

const DocumentViewer = dynamic(
  () =>
    import("@/src/components/DocumentViewer").then((mod) => mod.DocumentViewer),
  { ssr: false },
);

export default function HomePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(
    null,
  );
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      setLoadingSession(true);
      setError(null);

      try {
        const response = await createSession();
        setSessionId(response.session_id);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to create chat session.");
        }
      } finally {
        setLoadingSession(false);
      }
    };

    void initializeSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await uploadFile(file);
      setUploadedFile(response);
      setSelectedSource(null);
      setIsViewerOpen(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `File uploaded successfully: ${response.filename} (${response.chunks_created} chunks created). You can now ask questions about it.`,
          sources: null,
        },
      ]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAsk: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!sessionId) {
      setError("Chat session is not ready yet.");
      return;
    }

    if (!uploadedFile) {
      setError("Please upload a file first.");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    const currentQuestion = question.trim();

    setAsking(true);
    setError(null);
    setQuestion("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentQuestion,
        sources: null,
      },
      {
        role: "assistant",
        content: "",
        sources: null,
      },
    ]);

    try {
      await streamAskQuestion(
        {
          session_id: sessionId,
          question: currentQuestion,
        },
        (event) => {
          if (event.type === "token") {
            setMessages((prev) => {
              const updated = [...prev];
              const lastAssistantIndex = [...updated]
                .map((message, index) => ({ message, index }))
                .reverse()
                .find((entry) => entry.message.role === "assistant")?.index;

              if (lastAssistantIndex === undefined) {
                return updated;
              }

              updated[lastAssistantIndex] = {
                ...updated[lastAssistantIndex],
                content: `${updated[lastAssistantIndex].content}${event.content}`,
              };

              return updated;
            });
          }

          if (event.type === "done") {
            setMessages(event.messages);
          }

          if (event.type === "error") {
            setError(event.detail);
          }
        },
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to get answer.");
      }
    } finally {
      setAsking(false);
    }
  };

  const handleSourceClick = (source: SourceCitation) => {
    setSelectedSource(source);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedSource(null);
  };

  return (
    <>
      <main className="min-h-screen rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            <FileUploadSection
              file={file}
              uploadedFile={uploadedFile}
              loading={uploading}
              sessionId={sessionId}
              loadingSession={loadingSession}
              error={error}
              onFileChange={handleFileChange}
              onSubmit={handleUpload}
            />

            <section className="flex min-h-[700px] flex-col rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                  Chat
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Ask questions about your uploaded file
                </h2>
                <p className="mt-2 text-sm text-stone-300">
                  Follow-up questions will use prior conversation context.
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {messages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center text-sm text-stone-400">
                    Upload a document to begin, then ask your first question.
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                            isUser
                              ? "bg-cyan-300 text-slate-950"
                              : "border border-white/10 bg-black/30 text-stone-100"
                          }`}
                        >
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
                            {isUser ? "You" : "AI"}
                          </div>

                          {!isUser && !message.content.trim() && asking ? (
                            <div className="mt-2">
                              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                                Thinking
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.3s]" />
                                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.15s]" />
                                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300" />
                              </div>
                            </div>
                          ) : (
                            <>
                              {!isUser && !message.content.trim() && asking ? (
                                <div className="mt-2">
                                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                                    Thinking
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.3s]" />
                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.15s]" />
                                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300" />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="whitespace-pre-wrap leading-6">
                                    {message.content}
                                  </p>

                                  {!isUser &&
                                  message.content.trim() &&
                                  message.sources?.length ? (
                                    <SourceCitations
                                      sources={message.sources}
                                      selectedSource={selectedSource}
                                      onSourceClick={handleSourceClick}
                                    />
                                  ) : null}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleAsk}
                className="border-t border-white/10 px-6 py-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about the uploaded file..."
                    className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-stone-400 focus:border-cyan-300 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={
                      asking ||
                      !sessionId ||
                      !uploadedFile ||
                      question.trim().length === 0
                    }
                    className="cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:bg-stone-600 disabled:text-stone-300"
                  >
                    {asking ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>

      <DocumentViewer
        source={selectedSource}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
      />
    </>
  );
}
