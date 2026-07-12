"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Which contracts expire in the next 90 days?",
  "What are my total monthly payment obligations?",
  "Show me all contracts with auto-renewal clauses",
  "Find agreements with Net 30 payment terms",
  "What is the total portfolio value across all active contracts?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am ClearAudit AI. Ask me anything about your contract portfolio.\n\nTry questions like:\n- Which contracts expire this month?\n- What are my total payment obligations?\n- Find agreements with specific vendors",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.slice(1), userMsg],
          sessionId: "assistant-page",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] lg:h-screen max-w-4xl mx-auto">
      <div className="px-6 py-6 border-b border-[#EADFCF]">
        <h1 className="text-2xl font-serif font-black text-[#1E1C1B]">
          AI Assistant
        </h1>
        <p className="text-xs text-[#5C5651] mt-1">
          Ask natural language questions about your contract portfolio.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col max-w-[85%] ${
              msg.role === "user" ? "ml-auto items-end" : "items-start"
            }`}
          >
            <div
              className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#4B1218] text-[#FAF7F2] rounded-tr-none shadow-md"
                  : "bg-[#FAF7F2] text-[#1E1C1B] border border-[#EADFCF] rounded-tl-none"
              }`}
            >
              {msg.content.split("\n").map((line, k) => (
                <p key={k} className={k > 0 ? "mt-2" : ""}>
                  {line}
                </p>
              ))}
            </div>
            <span className="text-[9px] text-[#A69C90] mt-1 uppercase font-bold tracking-wider">
              {msg.role === "user" ? "You" : "ClearAudit AI"}
            </span>
          </div>
        ))}

        {sending && (
          <div className="flex flex-col items-start max-w-[85%]">
            <div className="px-5 py-3 bg-[#FAF7F2] border border-[#EADFCF] rounded-2xl rounded-tl-none text-sm text-[#A69C90] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4B1218] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#4B1218] animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-[#4B1218] animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        {messages.length === 1 && !sending && (
          <div className="pt-4 space-y-3">
            <p className="text-xs text-[#A69C90] font-semibold uppercase tracking-wider">
              Suggested Prompts
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestion(prompt)}
                  className="px-3.5 py-2 text-xs font-medium text-[#4B1218] bg-[#FFFDF9] border border-[#EADFCF] rounded-xl hover:bg-[#F4EBE1] hover:border-[#4B1218] transition-all text-left"
                >
                  <Sparkles size={10} className="inline mr-1.5 -mt-0.5" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="px-6 py-4 border-t border-[#EADFCF] bg-[#FAF7F2]"
      >
        <div className="flex gap-2.5 items-center max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your contracts..."
            disabled={sending}
            className="flex-1 px-4 py-3 bg-[#FFFDF9] border border-[#EADFCF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1218]/30 text-[#1E1C1B] placeholder-[#A69C90] disabled:opacity-50 transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-3 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] rounded-xl transition-all disabled:opacity-50 shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
