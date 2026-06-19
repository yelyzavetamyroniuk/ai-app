"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Message } from "@/types";

const vt = { fontFamily: "var(--font-vt323), 'Courier New', monospace" };

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...nextMessages, assistantMessage]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) throw new Error("Request failed");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          const data = line.slice(5).trim();
          if (data === "[DONE]") break;
          try {
            const event = JSON.parse(data);
            if (event.type === "content_block_delta") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + (event.delta?.text ?? ""),
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Помилка. Спробуй ще раз." };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="pixel-card space-y-3" style={{ border: "4px solid #2c3e7a", boxShadow: "5px 5px 0px #000" }}>
      <h2 className="font-pixel" style={{ fontSize: "10px", color: "#2c3e7a" }}>AI CHAT</h2>

      <div style={{ height: "400px", overflowY: "auto", border: "3px solid var(--border)", background: "#fff", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.length === 0 && (
          <p style={{ ...vt, fontSize: "20px", color: "var(--text-dim)", textAlign: "center", marginTop: "30px" }}>
            Почни розмову...
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%", padding: "10px 14px",
              border: "3px solid #2C3E50",
              background: msg.role === "user" ? "#FFF8DC" : "#e0f0ff",
              boxShadow: "3px 3px 0px #2C3E50",
              ...vt, fontSize: "20px", lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}>
              {msg.content || <span className="blink font-pixel" style={{ fontSize: "9px" }}>█</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напиши повідомлення..."
          disabled={isLoading}
          className="pixel-input"
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="pixel-btn pixel-btn-cta"
          style={{ fontSize: "10px", padding: "10px 16px" }}
        >
          {isLoading ? <span className="blink">█</span> : "SEND"}
        </button>
      </form>
    </div>
  );
}
