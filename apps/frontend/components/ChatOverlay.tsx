"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { getStoredToken } from "@/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Circle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  from: string;
  text: string;
  sentAt: string;
  outgoing?: boolean;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "https://cms-api.haudev.online";

function parseEmailFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.payload?.email ?? null;
  } catch {
    return null;
  }
}

export function ChatOverlay() {
  const [open, setOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineEmails, setOnlineEmails] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myEmail = useMemo(
    () => (typeof window !== "undefined" ? parseEmailFromToken(getStoredToken()) : null),
    [],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!myEmail) return;

    const socket = io(SOCKET_URL, {
      auth: { email: myEmail },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // Request current online list
      socket.emit("friend:online-list");
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("friend:status", ({ email, status }: { email: string; status: "online" | "offline" }) => {
      setOnlineEmails((prev) =>
        status === "online"
          ? prev.includes(email) ? prev : [...prev, email]
          : prev.filter((e) => e !== email)
      );
    });

    socket.on("friend:online-list", ({ onlineEmails }: { onlineEmails: string[] }) => {
      setOnlineEmails(onlineEmails.filter((e) => e !== myEmail));
    });

    socket.on("friend:message", (msg: Message) => {
      setMessages((prev) => [...prev, { ...msg, outgoing: false }]);
      if (!open) setUnread((n) => n + 1);
    });

    socket.on("friend:message:sent", (msg: Message) => {
      setMessages((prev) => [...prev, { ...msg, outgoing: true }]);
    });

    socket.on("friend:unread", ({ unread: n }: { unread: number }) => {
      setUnread(n);
    });

    return () => {
      socket.disconnect();
    };
  }, [myEmail, open]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages, scrollToBottom]);

  const sendMessage = () => {
    if (!input.trim() || !activePeer || !socketRef.current) return;
    socketRef.current.emit("friend:message", { to: activePeer, text: input.trim() });
    setInput("");
  };

  if (!myEmail) return null;

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat panel */}
        {open && (
          <div className="flex h-[480px] w-80 flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Circle
                  className={cn(
                    "h-2.5 w-2.5 fill-current",
                    isConnected ? "text-green-500" : "text-gray-400"
                  )}
                />
                <span className="text-sm font-semibold">
                  {activePeer ? activePeer.split("@")[0] : "Online Users"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {activePeer && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => { setActivePeer(null); setMessages([]); }}
                    title="Back to list"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Body */}
            {!activePeer ? (
              /* Online users list */
              <div className="flex-1 overflow-y-auto p-3">
                {onlineEmails.length === 0 ? (
                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    No other users online
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {onlineEmails.map((email) => (
                      <li key={email}>
                        <button
                          id={`chat-user-${email.replace(/[@.]/g, "-")}`}
                          onClick={() => setActivePeer(email)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                        >
                          <Circle className="h-2 w-2 fill-green-500 text-green-500 flex-shrink-0" />
                          <span className="truncate">{email}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              /* Message thread */
              <>
                <div className="flex-1 overflow-y-auto space-y-2 p-3">
                  {messages
                    .filter(
                      (m) =>
                        m.from === activePeer ||
                        (m.outgoing)
                    )
                    .map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex",
                          msg.outgoing ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                            msg.outgoing
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          )}
                        >
                          {msg.text}
                          <div className="mt-0.5 text-[10px] opacity-60">
                            {new Date(msg.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </div>
                {/* Input */}
                <div className="border-t p-3">
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  >
                    <Input
                      id="chat-input"
                      placeholder="Type a message…"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="h-9 flex-1 text-sm"
                    />
                    <Button
                      id="chat-send-btn"
                      type="submit"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}

        {/* Toggle button */}
        <button
          id="chat-overlay-toggle"
          onClick={() =>
            setOpen((o) => {
              const next = !o;
              if (next) setUnread(0);
              return next;
            })
          }
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
            "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
          )}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          {unread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </button>
      </div>
    </>
  );
}
