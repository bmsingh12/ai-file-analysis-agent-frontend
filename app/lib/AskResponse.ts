import { ChatMessage } from "./ChatMessage";

export type AskResponse = {
  answer: string;
  session_id: string;
  messages: ChatMessage[];
}