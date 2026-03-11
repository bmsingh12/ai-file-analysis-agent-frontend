import { ChatMessage } from "@/app/lib/ChatMessage";

type ChatMessageProps = {
  message: ChatMessage;
};

export default function ChatMsg({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-blue-600 text-white"
            : "border border-slate-200 bg-white text-slate-900",
        ].join(" ")}
      >
        <div className="mb-1 text-[11px] font-medium opacity-70">
          {isUser ? "You" : "AI"}
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}