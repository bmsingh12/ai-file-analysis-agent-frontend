import { SourceCitation } from "./SourceCitation";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[] | null;
}