"use client";

import { useState, useRef, useEffect } from "react";

/* ---------- FAQ data for HillNest ---------- */
type Message = {
  from: "bot" | "user";
  text: string;
};

const FAQS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["hi", "hello", "hey", "hii", "helo"],
    answer:
      "Hello! 👋 Welcome to HillNest Homestay. How can I help you today? You can ask me about rooms, pricing, check-in, amenities, or how to book!",
  },
  {
    keywords: ["price", "cost", "rate", "charge", "tariff", "how much"],
    answer:
      "💰 Our room rates start from:\n• Garden View Room — ₹2,499/night\n• Deluxe Valley Room — ₹2,999/night\n• Premium Family Suite — ₹4,499/night\n\nAll prices include complimentary breakfast. Would you like to book one?",
  },
  {
    keywords: ["room", "rooms", "suite", "accommodation", "stay"],
    answer:
      "🏠 We offer 3 room types:\n1. Garden View Room – cozy & budget-friendly\n2. Deluxe Valley Room – scenic valley views\n3. Premium Family Suite – spacious, ideal for families\n\nAll rooms include Wi-Fi, breakfast & mountain views!",
  },
  {
    keywords: ["check", "check-in", "checkout", "check out", "checkin", "time", "arrival"],
    answer:
      "🕐 Check-in: 12:00 PM\n⏰ Check-out: 11:00 AM\n\nEarly check-in or late checkout can be arranged on request (subject to availability).",
  },
  {
    keywords: ["breakfast", "food", "meal", "eat", "dining", "lunch", "dinner"],
    answer:
      "🍳 Complimentary breakfast is included with every room. We serve local Bengali cuisine along with continental options. Lunch and dinner can be arranged on request.",
  },
  {
    keywords: ["amenity", "amenities", "wifi", "internet", "parking", "pool"],
    answer:
      "✨ Our amenities include:\n• Free high-speed Wi-Fi\n• Free parking\n• Complimentary breakfast\n• 24/7 room service\n• Scenic mountain terrace\n• Nature walks & guided treks",
  },
  {
    keywords: ["location", "address", "where", "siliguri", "how to reach", "distance"],
    answer:
      "📍 We are located near Sevoke Road, Siliguri, West Bengal – 734001.\n\n🚗 ~45 min from NJP Railway Station\n✈️ ~1 hr from Bagdogra Airport\n\nWe can also arrange pickup on request!",
  },
  {
    keywords: ["book", "booking", "reserve", "reservation", "availability"],
    answer:
      "📅 To book a room, you can:\n1. Click 'Book Now' on our website\n2. WhatsApp us at +91 98765 43210\n3. Call us directly at +91 98765 43210\n\nShall I connect you on WhatsApp?",
  },
  {
    keywords: ["whatsapp", "call", "phone", "contact", "number", "reach"],
    answer:
      "📞 You can reach us at:\n• Phone: +91 98765 43210\n• Email: hillnest@email.com\n• WhatsApp: Click the green button on the bottom-right of this page!\n\nWe typically respond within 30 minutes. 😊",
  },
  {
    keywords: ["pet", "pets", "dog", "cat", "animal"],
    answer:
      "🐾 Pets are welcome at HillNest on request! Please inform us in advance so we can arrange a pet-friendly room. A small additional charge may apply.",
  },
  {
    keywords: ["cancel", "cancellation", "refund"],
    answer:
      "❌ Our cancellation policy:\n• Cancel 48+ hrs before check-in → Full refund\n• Cancel within 48 hrs → 50% refund\n• No-show → No refund\n\nFor emergencies, please contact us directly — we're always happy to help!",
  },
  {
    keywords: ["thank", "thanks", "thankyou", "great", "awesome", "perfect"],
    answer:
      "You're welcome! 😊 We look forward to hosting you at HillNest. Feel free to ask if you have more questions! 🏔️",
  },
];

const WELCOME: Message = {
  from: "bot",
  text: "Hi there! 🌿 I'm HillNest's assistant. I can answer questions about our rooms, prices, check-in, amenities & more.\n\nWhat would you like to know?",
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQS) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq.answer;
    }
  }
  return "🤔 I'm not sure about that yet. For detailed queries, please WhatsApp us at +91 98765 43210 or call us directly — we'd love to help! 😊";
}

const QUICK_REPLIES = ["Room prices", "Check-in time", "How to book", "Location", "Amenities"];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { from: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate a short typing delay
    setTimeout(() => {
      const reply = getBotReply(text);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      setIsTyping(false);
    }, 700);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          id="chatbot-window"
          className="fixed inset-x-3 bottom-24 z-[80] flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(4,21,26,0.94),rgba(9,40,40,0.82))] shadow-[0_24px_80px_rgba(2,6,23,0.38)] pointer-events-auto animate-in backdrop-blur-2xl sm:inset-x-auto sm:right-6 sm:bottom-28 sm:w-[340px] sm:max-h-[520px]"
          style={{ animation: "slideUp 0.25s ease-out" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">
                🌿
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#6F9487] rounded-full border-2 border-[#163E3C]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm leading-none">HillNest Assistant</p>
              <p className="text-white/70 text-xs mt-0.5">Online · usually replies instantly</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/70 hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-transparent px-4 py-4 space-y-3 min-h-0 max-h-[320px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.from === "bot" && (
                  <div className="w-6 h-6 rounded-full bg-[#325F57] text-white text-xs flex items-center justify-center mr-2 mt-1 shrink-0">
                    🌿
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.from === "user"
                      ? "bg-gradient-to-r from-[#163E3C] to-[#325F57] text-white rounded-br-none"
                      : "rounded-bl-none border border-white/10 bg-white/8 text-white/85 backdrop-blur-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#325F57] text-white text-xs flex items-center justify-center mr-2 mt-1 shrink-0">
                  🌿
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-none border border-white/10 bg-white/8 px-4 py-3 shadow-sm backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-2 border-t border-white/10 bg-white/5 px-4 pb-2">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                className="mt-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:bg-white/12"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 bg-white/6 px-3 py-3">
            <input
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="flex-1 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#6F9487]/50 focus:ring-2 focus:ring-teal-200/15 backdrop-blur-md"
            />
            <button
              type="submit"
              id="chatbot-send-btn"
              disabled={!input.trim()}
              aria-label="Send message"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#163E3C] to-[#6F9487] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        id="chatbot-toggle-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#163E3C] via-[#325F57] to-[#6F9487] text-white transition-all duration-300 touch-manipulation hover:scale-110 active:scale-95"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
      </button>

      {/* Slide-up keyframe */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
