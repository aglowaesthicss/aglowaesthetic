import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "model";
  content: string;
}

const SUGGESTIONS = [
  "What are your working hours?",
  "Where is the clinic located?",
  "What Korean services do you offer?",
  "Are there any special offers active?",
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Annyeonghaseyo! Welcome to Aglow Aesthetics. I am your Korean skincare assistant. How may I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Map frontend 'model' role to backend 'model' history structure
      const historyPayload = messages.map((m) => ({
        role: m.role === "model" ? "model" : "user",
        content: m.content,
      }));

      const data = await api.post<{ reply: string }>("/api/chat", {
        message: text,
        history: historyPayload,
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", content: data.reply },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: err.message || "I apologize, but I am currently offline. Please try again later or fill out our enquiry form.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Toggle Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-gold-gradient border border-primary/40 shadow-lift hover:scale-105 hover:bg-zinc-900 transition-all duration-300 group"
          aria-label="Open skin consultation chat"
        >
          <MessageSquare className="size-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="flex h-[32rem] w-80 sm:w-96 flex-col border border-border/80 bg-zinc-950/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-zinc-900/60 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Sparkles className="size-4.5 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-medium tracking-wide text-zinc-100">Aglow Skincare AI</h3>
                <span className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-primary">
                  <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                  Korean Prestige Chat
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 select-none items-center justify-center rounded-full border text-xs ${
                    m.role === "user"
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300"
                  }`}
                >
                  {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                <div
                  className={`rounded-lg px-4 py-3 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-zinc-800 text-zinc-100 rounded-tr-none"
                      : "bg-zinc-900/50 border border-zinc-900 text-zinc-200 rounded-tl-none font-light"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-lg bg-zinc-900/50 border border-zinc-900 px-4 py-3 text-zinc-400 rounded-tl-none flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {messages.length === 1 && (
            <div className="px-5 py-2 flex flex-wrap gap-1.5 bg-zinc-950">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="rounded-full border border-zinc-800 bg-zinc-900/30 px-3 py-1.5 text-[0.7rem] text-zinc-400 hover:border-primary/40 hover:text-primary transition-all duration-200 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="border-t border-border/60 bg-zinc-900/20 p-4 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask about treatments, locations, offers..."
              className="flex-1 rounded border border-border/80 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex size-9.5 items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors cursor-pointer"
            >
              <Send className="size-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
