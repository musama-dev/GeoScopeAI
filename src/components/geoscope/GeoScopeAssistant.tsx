import { useEffect, useRef, useState } from "react";
import {
  X,
  Send,
  Trash2,
} from "lucide-react";
import { useCity } from "../../context/city-context";
import type { Place } from "../../services/geo-api";

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
};

const CACHE_KEY = "geoscope_assistant_cache_v3";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem {
  text: string;
  timestamp: number;
}

const QUICK_CHIPS = [
  { label: "📍 Famous Places", query: "What are the famous places to visit in this city?" },
  { label: "🏛 History", query: "What is the history of this city?" },
  { label: "🌍 Geography", query: "Tell me about the geography and location of this city." },
  { label: "💰 Currency", query: "What is the currency used here?" },
  { label: "🗣 Language", query: "What languages are spoken here?" },
  { label: "👥 Population", query: "What is the population of this city?" },
  { label: "📍 Coordinates", query: "What are the geographic coordinates of this city?" },
  { label: "🕌 Famous Landmarks", query: "What are the most iconic landmarks here?" },
];

/** Clean raw text to ensure natural AI travel assistant tone. */
function sanitizeText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/^according to [^.,;]+[,;]?\s*/i, "")
    .replace(/^wikipedia says[,;]?\s*/i, "")
    .replace(/\s*\([^)]*wikipedia[^)]*\)/gi, "")
    .replace(/\[\d+\]/g, "") // remove footnote reference numbers like [1], [2]
    .replace(/https?:\/\/\S+/gi, "") // strip raw URLs if any
    .trim();
}

/** Format query with city context. */
function buildCityQuery(userQuery: string, place: Place): { apiQuery: string; instantAnswer?: string } {
  const q = userQuery.trim().toLowerCase();
  const city = place.name;
  const country = place.country;

  // Instant coordinates handler
  if (q.includes("coordinate") || q.includes("lat") || q.includes("long")) {
    const latStr = `${Math.abs(place.latitude).toFixed(4)}° ${place.latitude >= 0 ? "N" : "S"}`;
    const lngStr = `${Math.abs(place.longitude).toFixed(4)}° ${place.longitude >= 0 ? "E" : "W"}`;
    const elev = place.elevation != null ? ` with an elevation of approx. ${place.elevation} meters` : "";
    return {
      apiQuery: "",
      instantAnswer: `📍 ${city}, ${country} is located at geographic coordinates ${latStr}, ${lngStr}${elev}.`,
    };
  }

  // Instant population handler if in place object
  if ((q.includes("population") || q === "👥 population") && place.population) {
    return {
      apiQuery: "",
      instantAnswer: `👥 The estimated population of ${city}, ${country} is approximately ${new Intl.NumberFormat("en-US").format(place.population)} residents.`,
    };
  }

  if (q.includes("famous place") || q.includes("landmark") || q.includes("visit")) {
    return { apiQuery: `${city} famous landmarks tourist attractions` };
  }
  if (q.includes("history")) {
    return { apiQuery: `History of ${city}` };
  }
  if (q.includes("geography") || q.includes("location")) {
    return { apiQuery: `Geography of ${city} ${country}` };
  }
  if (q.includes("currency") || q.includes("money")) {
    return { apiQuery: `Currency used in ${country}` };
  }
  if (q.includes("language") || q.includes("speak")) {
    return { apiQuery: `Languages spoken in ${city} ${country}` };
  }
  if (q.includes("population")) {
    return { apiQuery: `Population of ${city} ${country}` };
  }

  // If user question already mentions the city name, use directly
  if (q.includes(city.toLowerCase())) {
    return { apiQuery: userQuery.trim() };
  }

  // Default: append city name for location specificity
  return { apiQuery: `${userQuery.trim()} ${city}` };
}

/** Fetch factual answer formatted as a premium built-in AI assistant. */
async function fetchAssistantAnswer(rawQuery: string, place: Place): Promise<string> {
  const { apiQuery, instantAnswer } = buildCityQuery(rawQuery, place);

  if (instantAnswer) {
    return instantAnswer;
  }

  const cacheKey = `${place.name.toLowerCase()}_${apiQuery.toLowerCase()}`;

  // 1. Check Local 24h Cache
  try {
    const rawCache = localStorage.getItem(CACHE_KEY);
    if (rawCache) {
      const cacheMap: Record<string, CacheItem> = JSON.parse(rawCache);
      const cached = cacheMap[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.text;
      }
    }
  } catch {
    /* ignore storage errors */
  }

  let resultText = "";

  // 2. Fetch specific topic summary
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(apiQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.type !== "disambiguation" && data.extract && data.extract.length > 20) {
        resultText = sanitizeText(data.extract);
      }
    }
  } catch {
    /* try next provider */
  }

  // 3. Instant Answer search fallback
  if (!resultText) {
    try {
      const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(apiQuery)}&format=json&no_html=1&skip_disambig=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.AbstractText && data.AbstractText.trim().length > 0) {
          resultText = sanitizeText(data.AbstractText);
        } else if (data.Answer && data.Answer.trim().length > 0) {
          resultText = sanitizeText(data.Answer);
        } else if (data.Definition && data.Definition.trim().length > 0) {
          resultText = sanitizeText(data.Definition);
        } else if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length > 0) {
          const snippets: string[] = [];
          for (const topic of data.RelatedTopics) {
            if (topic.Text && typeof topic.Text === "string" && topic.Text.length > 15) {
              snippets.push(sanitizeText(topic.Text));
              if (snippets.length >= 2) break;
            }
          }
          if (snippets.length > 0) {
            resultText = snippets.join("\n\n");
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  // 4. Topic Search fallback
  if (!resultText) {
    try {
      const sRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(apiQuery)}&format=json&origin=*`,
      );
      if (sRes.ok) {
        const sData = await sRes.json();
        const firstMatch = sData.query?.search?.[0]?.title;
        if (firstMatch) {
          const sumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstMatch)}`);
          if (sumRes.ok) {
            const sumData = await sumRes.json();
            if (sumData.extract && sumData.extract.length > 20) {
              resultText = sanitizeText(sumData.extract);
            }
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  // 5. Friendly error handling without technical jargon or provider names
  if (!resultText || resultText.trim().length === 0) {
    resultText = "I couldn't find reliable information for that question. Please try asking in a different way.";
  }

  // Save to 24-hour cache
  try {
    const rawCache = localStorage.getItem(CACHE_KEY);
    const cacheMap: Record<string, CacheItem> = rawCache ? JSON.parse(rawCache) : {};
    cacheMap[cacheKey] = { text: resultText, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheMap));
  } catch {
    /* ignore storage errors */
  }

  return resultText;
}

export function GeoScopeAssistant() {
  const { place } = useCity();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto update assistant context whenever searched city changes
  useEffect(() => {
    const welcomeMsg: Message = {
      id: `welcome-${place.name}-${Date.now()}`,
      sender: "assistant",
      text: `Hello! I'm your GeoScope Travel Assistant. Ask me anything about this location or select a quick topic below!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, [place.name, place.country]);

  // Auto scroll on new message
  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const answerText = await fetchAssistantAnswer(queryText, place);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: answerText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: `assistant-err-${Date.now()}`,
        sender: "assistant",
        text: "I couldn't find reliable information for that question. Please try asking in a different way.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    const welcomeMsg: Message = {
      id: `welcome-${place.name}-${Date.now()}`,
      sender: "assistant",
      text: `Chat cleared. Ask me anything about this location!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  };

  return (
    <aside aria-label="GeoScope Assistant" className="fixed bottom-5 right-5 z-[1200]">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group glass-strong relative grid h-12 w-12 place-items-center rounded-full p-2 shadow-2xl transition-all duration-300 hover:scale-110 border border-white/30"
          title="Open GeoScope Assistant"
        >
          <div className="relative grid h-8 w-8 place-items-center rounded-full bg-primary/20 overflow-hidden p-0.5 shadow-inner border border-primary/30">
            <img
              src="/images/geoscope-icon-dark.png"
              alt="GeoScope AI"
              className="h-full w-full object-contain dark:hidden"
            />
            <img
              src="/images/geoscope-icon-light.png"
              alt="GeoScope AI"
              className="hidden h-full w-full object-contain dark:block"
            />
          </div>
        </button>
      )}

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div className="glass-strong flex h-[520px] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl shadow-2xl border border-glass-border animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-glass-border p-3.5 bg-black/10 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/20 overflow-hidden p-1 border border-primary/30">
                <img
                  src="/images/geoscope-icon-dark.png"
                  alt="GeoScope AI"
                  className="h-full w-full object-contain dark:hidden"
                />
                <img
                  src="/images/geoscope-icon-light.png"
                  alt="GeoScope AI"
                  className="hidden h-full w-full object-contain dark:block"
                />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold leading-tight tracking-tight">
                  GeoScope Assistant
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear Chat"
                className="glass-chip grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize Assistant"
                className="glass-chip grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-br-xs"
                      : "glass-chip text-foreground border border-glass-border rounded-bl-xs"
                  }`}
                >
                  {msg.text.split("\n\n").map((para, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {para.includes("**")
                        ? para.split("**").map((part, idx) =>
                            idx % 2 === 1 ? (
                              <strong key={idx} className="font-semibold text-primary">
                                {part}
                              </strong>
                            ) : (
                              part
                            ),
                          )
                        : para}
                    </p>
                  ))}
                </div>
                <span className="mt-1 px-1 text-[9px] text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(msg.timestamp)}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 glass-chip w-fit rounded-2xl px-3.5 py-2 text-xs text-muted-foreground border border-glass-border">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-1 text-[11px] font-medium">GeoScope AI thinking...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 py-1.5 border-t border-glass-border bg-black/5 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleSend(chip.query)}
                disabled={isTyping}
                className="glass-chip shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-medium text-foreground hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="p-2.5 border-t border-glass-border bg-black/10 backdrop-blur-md flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask about ${place.name}...`}
              disabled={isTyping}
              className="flex-1 bg-transparent px-3 py-2 text-xs outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40 shrink-0"
              title="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
