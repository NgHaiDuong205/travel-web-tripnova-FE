import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n/I18nContext";
import {
    closeChatSession,
    createChatSession,
    fetchChatMessages,
    fetchChatSessions,
    sendChatFeedback,
    sendChatMessage,
} from "../../services/aiService";
import { withRedirect } from "../../utils/authRedirect";
import { formatDateTime } from "../../utils/formatters";
import { AssistantBubble, BotAvatar, Thinking, UserBubble } from "./ChatBubbles";
import ChatLauncher, { EDGE_MARGIN, LAUNCHER_SIZE } from "./ChatLauncher";

const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 620;
const GREETING_DELAY_MS = 1200;

const MAX_CHARS = 2000;
const SUGGESTION_KEYS = ["s1", "s2", "s3", "s4"];
const STORAGE_KEY = "tripnova.chatWidget";
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
// Trang chi tiết -> ngữ cảnh gửi kèm câu hỏi ("khách sạn này" = khách sạn đang xem).
const CONTEXT_ROUTES = [
    { type: "landmark", re: new RegExp(`^/destinations/[^/]+/landmarks/(${UUID})`, "i") },
    { type: "destination", re: new RegExp(`^/destinations/(${UUID})/?$`, "i") },
    { type: "hotel", re: new RegExp(`^/hotel/(${UUID})`, "i") }, // gồm /hotel/:id/room/:roomId
    { type: "tour", re: new RegExp(`^/tours/(${UUID})`, "i") },
    { type: "car", re: new RegExp(`^/cars/(${UUID})`, "i") },
    { type: "flight", re: new RegExp(`^/flights/(${UUID})`, "i") },
];

function pageContext(pathname) {
    for (const { type, re } of CONTEXT_ROUTES) {
        const match = pathname.match(re);
        if (match) return { contextType: type, contextId: match[1] };
    }
    return null;
}

function readStored() {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function writeStored(value) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        /* storage bị chặn: bỏ qua */
    }
}

/**
 * Nút trợ lý AI tròn nổi góc dưới phải trên mọi trang khách; bấm mở khung chat nhỏ (điện thoại: toàn màn hình).
 * Trạng thái mở + phiên đang xem nhớ theo tab (sessionStorage). Trên trang chi tiết, câu hỏi gửi kèm ngữ cảnh trang.
 */
function ChatWidget() {
    const { t, lang } = useI18n();
    const { user, isLoggedIn, initializing } = useAuth();
    const location = useLocation();
    const context = pageContext(location.pathname);

    const stored = useRef(readStored());
    const [open, setOpen] = useState(!!stored.current.open);
    const [view, setView] = useState("chat"); // chat | history
    const [sessions, setSessions] = useState([]);
    const [activeId, setActiveId] = useState(stored.current.activeId || null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [launcherPos, setLauncherPos] = useState(null);
    const [greetingReady, setGreetingReady] = useState(false);
    const [greetingDismissed, setGreetingDismissed] = useState(!!stored.current.greetingDismissed);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const skipLoadRef = useRef(null);
    const userId = user?.id || null;
    const lastUserRef = useRef(stored.current.userId || null);

    // Đổi tài khoản / đăng xuất -> bỏ phiên của người trước (chờ tải xong user khi mở trang).
    useEffect(() => {
        if (initializing) return;
        if (lastUserRef.current !== userId) {
            lastUserRef.current = userId;
            setActiveId(null);
            setMessages([]);
            setSessions([]);
            setView("chat");
        }
    }, [userId, initializing]);

    useEffect(() => {
        if (!initializing) writeStored({ open, activeId, userId, greetingDismissed });
    }, [open, activeId, userId, initializing, greetingDismissed]);

    // Lời chào hiện sau một nhịp khi trang đã tải; mở chat hoặc bấm ✕ thì ẩn (nhớ theo tab).
    useEffect(() => {
        const timer = window.setTimeout(() => setGreetingReady(true), GREETING_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (open) setGreetingDismissed(true);
    }, [open]);

    const loadSessions = useCallback(() => {
        return fetchChatSessions({ limit: 30 })
            .then((data) => setSessions(data.items))
            .catch((err) => setError(err.message));
    }, []);

    useEffect(() => {
        if (open && isLoggedIn) loadSessions();
    }, [open, isLoggedIn, loadSessions]);

    useEffect(() => {
        if (!open || !isLoggedIn || !activeId) {
            if (!activeId) setMessages([]);
            return undefined;
        }
        if (skipLoadRef.current === activeId) {
            skipLoadRef.current = null;
            return undefined;
        }
        let cancelled = false;
        setLoading(true);
        fetchChatMessages(activeId)
            .then((data) => !cancelled && setMessages(data))
            .catch((err) => {
                if (cancelled) return;
                // Phiên đã bị xoá ở nơi khác -> bắt đầu phiên mới.
                if (err.status === 404) setActiveId(null);
                else setError(err.message);
            })
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [open, isLoggedIn, activeId]);

    useEffect(() => {
        if (open && view === "chat") bottomRef.current?.scrollIntoView({ block: "end" });
    }, [messages, sending, open, view]);

    useEffect(() => {
        if (open && view === "chat" && isLoggedIn) inputRef.current?.focus();
    }, [open, view, isLoggedIn]);

    // Esc đóng khung chat.
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => event.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const send = async (text) => {
        const content = (text ?? input).trim();
        if (!content || sending) return;
        setError("");
        setSending(true);
        setInput("");
        const pending = { id: `pending-${Date.now()}`, role: "user", content, pending: true };
        setMessages((prev) => [...prev, pending]);
        try {
            let sessionId = activeId;
            if (!sessionId) {
                const session = await createChatSession(context || {});
                sessionId = session.id;
                skipLoadRef.current = sessionId;
                setActiveId(sessionId);
            }
            const reply = await sendChatMessage(sessionId, content, lang === "vi" ? "vi" : "en", context);
            setMessages((prev) => [...prev.filter((m) => m.id !== pending.id), reply.userMessage, reply.assistantMessage]);
            setSessions((prev) => [reply.session, ...prev.filter((s) => s.id !== reply.session.id)]);
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.id !== pending.id));
            setInput(content);
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const retry = (assistantIndex) => {
        const question = messages.slice(0, assistantIndex).reverse().find((m) => m.role === "user");
        if (question) send(question.content);
    };

    const startNewChat = () => {
        setActiveId(null);
        setMessages([]);
        setError("");
        setView("chat");
    };

    const openSession = (id) => {
        setError("");
        setActiveId(id);
        setView("chat");
    };

    const removeSession = async (session) => {
        if (!window.confirm(t("chatbot.deleteConfirm"))) return;
        try {
            await closeChatSession(session.id);
            setSessions((prev) => prev.filter((s) => s.id !== session.id));
            if (session.id === activeId) startNewChat();
        } catch (err) {
            setError(err.message);
        }
    };

    const rate = async (message, isHelpful) => {
        try {
            const updated = await sendChatFeedback(message.id, { isHelpful });
            setMessages((prev) =>
                prev.map((m) => (m.id === message.id ? { ...m, feedbackHelpful: updated.feedbackHelpful } : m))
            );
        } catch (err) {
            setError(err.message);
        }
    };

    // Bấm link trong câu trả lời trên điện thoại: đóng khung (đang phủ toàn màn hình) để thấy trang mới.
    const onLinkClick = (event) => {
        if (event.target.closest("a") && window.matchMedia("(max-width: 639px)").matches) setOpen(false);
    };

    if (initializing) return null;

    // Khung chat (màn hình >= 640px) mở cạnh nút: cùng phía, phía trên nếu nút ở nửa dưới màn hình.
    let panelStyle;
    let panelOrigin = "bottom right";
    if (launcherPos && !launcherPos.vp.mobile) {
        const { vp, side, top } = launcherPos;
        const height = Math.min(PANEL_HEIGHT, vp.h - 2 * EDGE_MARGIN);
        const width = Math.min(PANEL_WIDTH, vp.w - 2 * EDGE_MARGIN);
        const above = top + LAUNCHER_SIZE / 2 > vp.h / 2;
        let panelTop = above ? top - 12 - height : top + LAUNCHER_SIZE + 12;
        panelTop = Math.min(Math.max(panelTop, EDGE_MARGIN), vp.h - height - EDGE_MARGIN);
        panelStyle = {
            top: panelTop,
            left: side === "left" ? EDGE_MARGIN : vp.w - width - EDGE_MARGIN,
            width,
            height,
            transformOrigin: `${above ? "bottom" : "top"} ${side}`,
        };
        panelOrigin = panelStyle.transformOrigin;
    }
    const greeting = user?.fullName
        ? t("chatbot.greetingNamed", { name: givenName(user.fullName, lang) })
        : t("chatbot.greeting");

    return (
        <>
            {open && (
                <section
                    role="dialog"
                    aria-label={t("chatbot.title")}
                    data-testid="chat-widget"
                    style={panelStyle || { transformOrigin: panelOrigin }}
                    className={`tn-panel-in fixed z-[70] flex flex-col overflow-hidden bg-white shadow-2xl border border-outline-variant/30 ${
                        panelStyle ? "rounded-2xl" : "inset-0"
                    }`}
                >
                    <header className="flex items-center gap-2 bg-primary px-3 py-2.5 text-white">
                        <span className="relative h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px] tn-bot-icon">smart_toy</span>
                            <span className="tn-online-dot absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-primary" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm leading-tight">{t("chatbot.title")}</p>
                            <p className="text-[11px] text-white/70 truncate">{t("chatbot.subtitle")}</p>
                        </div>
                        {isLoggedIn && (
                            <>
                                <HeaderButton
                                    icon={view === "history" ? "chat" : "forum"}
                                    label={view === "history" ? t("chatbot.backToChat") : t("chatbot.history")}
                                    onClick={() => setView(view === "history" ? "chat" : "history")}
                                />
                                <HeaderButton icon="add_comment" label={t("chatbot.newChat")} onClick={startNewChat} />
                            </>
                        )}
                        <HeaderButton icon="close" label={t("chatbot.close")} onClick={() => setOpen(false)} />
                    </header>

                    {!isLoggedIn ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                            <BotAvatar size="h-14 w-14" />
                            <p className="font-extrabold text-on-surface">{t("chatbot.loginTitle")}</p>
                            <p className="text-sm text-on-surface-variant">{t("chatbot.loginText")}</p>
                            <Link
                                to={withRedirect("/login", location.pathname + location.search)}
                                onClick={() => setOpen(false)}
                                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
                            >
                                <span className="material-symbols-outlined text-[18px]">login</span>
                                {t("chatbot.loginButton")}
                            </Link>
                        </div>
                    ) : view === "history" ? (
                        <div className="flex-1 overflow-y-auto p-3" data-testid="chat-widget-history">
                            {sessions.length === 0 ? (
                                <p className="p-4 text-center text-sm text-on-surface-variant">{t("chatbot.emptyHistory")}</p>
                            ) : (
                                <ul className="space-y-1">
                                    {sessions.map((s) => (
                                        <li key={s.id} className="group flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openSession(s.id)}
                                                className={`flex-1 min-w-0 text-left rounded-lg px-3 py-2 text-sm ${
                                                    s.id === activeId
                                                        ? "bg-primary/10 text-primary font-semibold"
                                                        : "hover:bg-surface-container-low text-on-surface"
                                                }`}
                                            >
                                                <span className="block truncate">{s.title || t("chatbot.untitled")}</span>
                                                <span className="block text-[10px] text-on-surface-variant">{formatDateTime(s.updatedAt)}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeSession(s)}
                                                aria-label={t("chatbot.deleteChat")}
                                                title={t("chatbot.deleteChat")}
                                                className="p-1 rounded text-on-surface-variant hover:text-red-600"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3" data-testid="chat-widget-messages">
                                {loading ? (
                                    <p className="text-center text-sm text-on-surface-variant">{t("chatbot.loading")}</p>
                                ) : messages.length === 0 ? (
                                    <Welcome t={t} context={context} onPick={send} disabled={sending} />
                                ) : (
                                    messages.map((m, index) =>
                                        m.role === "user" ? (
                                            <UserBubble key={m.id} message={m} />
                                        ) : (
                                            <AssistantBubble
                                                key={m.id}
                                                message={m}
                                                t={t}
                                                busy={sending}
                                                onRetry={() => retry(index)}
                                                onRate={(helpful) => rate(m, helpful)}
                                                onLinkClick={onLinkClick}
                                            />
                                        )
                                    )
                                )}
                                {sending && <Thinking t={t} />}
                                <div ref={bottomRef} />
                            </div>

                            <div className="border-t border-outline-variant/30 p-2.5 space-y-1.5">
                                {error && <p className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">{error}</p>}
                                {context && (
                                    <p className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[14px]">my_location</span>
                                        {t("chatbot.contextNote", { type: t(`chatbot.contextTypes.${context.contextType}`) })}
                                    </p>
                                )}
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        send();
                                    }}
                                    className="flex items-end gap-2"
                                >
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(event) => setInput(event.target.value.slice(0, MAX_CHARS))}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                                                event.preventDefault();
                                                send();
                                            }
                                        }}
                                        rows={1}
                                        placeholder={t("chatbot.placeholder")}
                                        aria-label={t("chatbot.placeholder")}
                                        className="flex-1 max-h-28 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !input.trim()}
                                        aria-label={t("chatbot.send")}
                                        title={t("chatbot.send")}
                                        className="h-10 w-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                    </button>
                                </form>
                                <p className="text-center text-[10px] text-on-surface-variant">{t("chatbot.disclaimer")}</p>
                            </div>
                        </>
                    )}
                </section>
            )}

            <ChatLauncher
                open={open}
                onToggle={() => setOpen((v) => !v)}
                onPositionChange={setLauncherPos}
                greeting={greeting}
                showGreeting={greetingReady && !greetingDismissed}
                onDismissGreeting={() => setGreetingDismissed(true)}
                labels={{
                    open: t("chatbot.launcher"),
                    close: t("chatbot.minimize"),
                    drag: t("chatbot.dragHint"),
                    dismiss: t("chatbot.dismissGreeting"),
                }}
            />
        </>
    );
}

/** Tên gọi để chào: tiếng Việt lấy chữ cuối (Nguyễn Hải Dương → Dương), tiếng Anh lấy chữ đầu. */
function givenName(fullName, lang) {
    const parts = fullName.trim().split(/\s+/);
    return lang === "vi" ? parts[parts.length - 1] : parts[0];
}

function HeaderButton({ icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/15"
        >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </button>
    );
}

function Welcome({ t, context, onPick, disabled }) {
    const suggestions = [
        ...(context ? [t(`chatbot.contextSuggestions.${context.contextType}`)] : []),
        ...SUGGESTION_KEYS.map((key) => t(`chatbot.suggestions.${key}`)),
    ];
    return (
        <div className="text-center pt-4">
            <div className="flex justify-center">
                <BotAvatar size="h-12 w-12" />
            </div>
            <p className="mt-2 font-extrabold text-on-surface">{t("chatbot.welcomeTitle")}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{t("chatbot.welcomeText")}</p>
            <div className="mt-4 flex flex-col items-stretch gap-1.5">
                {suggestions.map((text) => (
                    <button
                        key={text}
                        type="button"
                        disabled={disabled}
                        onClick={() => onPick(text)}
                        className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-left text-xs text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ChatWidget;
