import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogHero from "../../../components/catalog/CatalogHero";
import ChatMarkdown from "../../../components/ai/ChatMarkdown";
import FormAlert from "../../../components/common/FormAlert";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n/I18nContext";
import {
    closeChatSession,
    createChatSession,
    fetchChatMessages,
    fetchChatSessions,
    sendChatFeedback,
    sendChatMessage,
} from "../../../services/aiService";
import { withRedirect } from "../../../utils/authRedirect";
import { formatDateTime } from "../../../utils/formatters";

const HERO_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2000&q=80";
const MAX_CHARS = 2000;
const SUGGESTION_KEYS = ["s1", "s2", "s3", "s4"];
const CONTEXT_TYPES = ["hotel", "tour", "car", "flight", "destination", "landmark"];

/** Trợ lý du lịch AI: hỏi đáp khách sạn / tour / xe / chuyến bay (dữ liệu thật) + chính sách (tài liệu). */
function AiPlanner() {
    const { t, lang } = useI18n();
    const { isLoggedIn, initializing } = useAuth();
    const [searchParams] = useSearchParams();
    const contextType = searchParams.get("contextType");
    const contextId = searchParams.get("contextId");
    const context = CONTEXT_TYPES.includes(contextType) && contextId ? { contextType, contextId } : null;

    const [sessions, setSessions] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState("");
    const bottomRef = useRef(null);
    // Phiên vừa tạo trong lúc gửi: không tải lại tin (sẽ xoá tin đang chờ).
    const skipLoadRef = useRef(null);

    const loadSessions = useCallback(() => {
        return fetchChatSessions({ limit: 50 })
            .then((data) => setSessions(data.items))
            .catch((err) => setError(err.message));
    }, []);

    useEffect(() => {
        if (isLoggedIn) loadSessions();
    }, [isLoggedIn, loadSessions]);

    useEffect(() => {
        if (!activeId) {
            setMessages([]);
            return undefined;
        }
        if (skipLoadRef.current === activeId) {
            skipLoadRef.current = null;
            return undefined;
        }
        let cancelled = false;
        setLoadingMessages(true);
        fetchChatMessages(activeId)
            .then((data) => !cancelled && setMessages(data))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoadingMessages(false));
        return () => {
            cancelled = true;
        };
    }, [activeId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, sending]);

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
            const reply = await sendChatMessage(sessionId, content, lang === "vi" ? "vi" : "en");
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
    };

    const removeSession = async (session) => {
        if (!window.confirm(t("planner.chat.closeConfirm"))) return;
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

    return (
        <main className="bg-surface-container-low min-h-screen pb-16">
            <CatalogHero
                image={HERO_IMAGE}
                alt={t("planner.hero.imageAlt")}
                eyebrow={t("planner.hero.eyebrow")}
                title={t("planner.hero.title")}
                subtitle={t("planner.hero.subtitle")}
                heightClass="md:h-[360px]"
            />

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-10">
                {initializing ? (
                    <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-on-surface-variant">
                        {t("planner.chat.loading")}
                    </div>
                ) : !isLoggedIn ? (
                    <LoginPrompt t={t} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                        <aside className="bg-white rounded-2xl shadow-lg border border-outline-variant/30 p-4 h-fit lg:sticky lg:top-24">
                            <button
                                type="button"
                                onClick={startNewChat}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold py-2.5 text-sm hover:opacity-90"
                            >
                                <span className="material-symbols-outlined text-[18px]">add_comment</span>
                                {t("planner.chat.newChat")}
                            </button>
                            <h2 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                {t("planner.chat.history")}
                            </h2>
                            {sessions.length === 0 ? (
                                <p className="text-sm text-on-surface-variant">{t("planner.chat.emptyHistory")}</p>
                            ) : (
                                <ul className="space-y-1 max-h-[55vh] overflow-y-auto pr-1" data-testid="chat-sessions">
                                    {sessions.map((s) => (
                                        <li key={s.id} className="group flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setActiveId(s.id)}
                                                className={`flex-1 min-w-0 text-left rounded-lg px-3 py-2 text-sm ${
                                                    s.id === activeId
                                                        ? "bg-primary/10 text-primary font-semibold"
                                                        : "hover:bg-surface-container-low text-on-surface"
                                                }`}
                                            >
                                                <span className="block truncate">{s.title || t("planner.chat.untitled")}</span>
                                                <span className="block text-[11px] text-on-surface-variant">
                                                    {formatDateTime(s.updatedAt)}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeSession(s)}
                                                aria-label={t("planner.chat.close")}
                                                title={t("planner.chat.close")}
                                                className="opacity-60 group-hover:opacity-100 p-1 rounded text-on-surface-variant hover:text-red-600"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </aside>

                        <section className="bg-white rounded-2xl shadow-lg border border-outline-variant/30 flex flex-col min-h-[65vh]">
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[65vh]" data-testid="chat-messages">
                                {loadingMessages ? (
                                    <p className="text-center text-sm text-on-surface-variant">{t("planner.chat.loading")}</p>
                                ) : messages.length === 0 ? (
                                    <Welcome t={t} onPick={send} disabled={sending} />
                                ) : (
                                    messages.map((m, index) =>
                                        m.role === "user" ? (
                                            <UserBubble key={m.id} message={m} />
                                        ) : (
                                            <AssistantBubble
                                                key={m.id}
                                                message={m}
                                                t={t}
                                                onRetry={() => retry(index)}
                                                onRate={(helpful) => rate(m, helpful)}
                                                busy={sending}
                                            />
                                        )
                                    )
                                )}
                                {sending && <Thinking t={t} />}
                                <div ref={bottomRef} />
                            </div>

                            <div className="border-t border-outline-variant/30 p-4 space-y-2">
                                <FormAlert>{error}</FormAlert>
                                {context && !activeId && (
                                    <p className="text-xs text-on-surface-variant">
                                        {t("planner.chat.contextNote", {
                                            type: t(`planner.chat.contextTypes.${context.contextType}`),
                                        })}
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
                                        value={input}
                                        onChange={(event) => setInput(event.target.value.slice(0, MAX_CHARS))}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                                                event.preventDefault();
                                                send();
                                            }
                                        }}
                                        rows={2}
                                        placeholder={t("planner.chat.placeholder")}
                                        aria-label={t("planner.chat.placeholder")}
                                        className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !input.trim()}
                                        className="h-12 px-5 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        {t("planner.chat.send")}
                                    </button>
                                </form>
                                <p className="text-[11px] text-on-surface-variant flex justify-between gap-4">
                                    <span>{t("planner.chat.disclaimer")}</span>
                                    <span>
                                        {input.length}/{MAX_CHARS}
                                    </span>
                                </p>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}

function LoginPrompt({ t }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-primary">smart_toy</span>
            <h2 className="mt-3 text-2xl font-extrabold text-on-surface">{t("planner.chat.loginTitle")}</h2>
            <p className="mt-2 text-on-surface-variant">{t("planner.chat.loginText")}</p>
            <Link
                to={withRedirect("/login", "/ai-planner")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:opacity-90"
            >
                <span className="material-symbols-outlined text-[18px]">login</span>
                {t("planner.chat.loginButton")}
            </Link>
        </div>
    );
}

function Welcome({ t, onPick, disabled }) {
    return (
        <div className="text-center py-8">
            <span className="material-symbols-outlined text-5xl text-primary">travel_explore</span>
            <h2 className="mt-2 text-xl font-extrabold text-on-surface">{t("planner.chat.welcomeTitle")}</h2>
            <p className="mt-1 text-sm text-on-surface-variant max-w-lg mx-auto">{t("planner.chat.welcomeText")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTION_KEYS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        onClick={() => onPick(t(`planner.chat.suggestions.${key}`))}
                        className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                        {t(`planner.chat.suggestions.${key}`)}
                    </button>
                ))}
            </div>
        </div>
    );
}

function UserBubble({ message }) {
    return (
        <div className="flex justify-end">
            <div
                className={`max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-white whitespace-pre-wrap ${
                    message.pending ? "opacity-70" : ""
                }`}
            >
                {message.content}
            </div>
        </div>
    );
}

function AssistantBubble({ message, t, onRetry, onRate, busy }) {
    const [openSource, setOpenSource] = useState(null);
    const sources = message.sources || [];
    const showSource = (citation) => setOpenSource((current) => (current === citation ? null : citation));

    if (message.isError) {
        return (
            <div className="flex gap-3">
                <Avatar error />
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <p>{message.content}</p>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={onRetry}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        {t("planner.chat.retry")}
                    </button>
                </div>
            </div>
        );
    }

    const current = sources.find((s) => s.citation === openSource);
    return (
        <div className="flex gap-3" data-testid="assistant-message">
            <Avatar />
            <div className="max-w-[85%] min-w-0">
                <div className="rounded-2xl rounded-bl-sm bg-surface-container-low px-4 py-3 text-on-surface">
                    <ChatMarkdown text={message.content} onCitation={sources.length ? showSource : undefined} />
                </div>
                {sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-on-surface-variant">{t("planner.chat.sources")}:</span>
                        {sources.map((s) => (
                            <button
                                key={s.citation}
                                type="button"
                                onClick={() => showSource(s.citation)}
                                className={`rounded-full border px-2 py-0.5 ${
                                    openSource === s.citation
                                        ? "border-amber-400 bg-amber-100"
                                        : "border-outline-variant/50 hover:bg-surface-container-low"
                                }`}
                            >
                                <strong>{s.citation}</strong> {s.title}
                            </button>
                        ))}
                    </div>
                )}
                {current && (
                    <blockquote className="mt-2 rounded-lg border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900 whitespace-pre-wrap">
                        {current.text}
                    </blockquote>
                )}
                <div className="mt-1 flex items-center gap-1 text-on-surface-variant">
                    <span className="text-[11px] mr-1">{formatDateTime(message.createdAt)}</span>
                    <FeedbackButton
                        icon="thumb_up"
                        label={t("planner.chat.helpful")}
                        active={message.feedbackHelpful === true}
                        onClick={() => onRate(true)}
                    />
                    <FeedbackButton
                        icon="thumb_down"
                        label={t("planner.chat.notHelpful")}
                        active={message.feedbackHelpful === false}
                        onClick={() => onRate(false)}
                    />
                </div>
            </div>
        </div>
    );
}

function FeedbackButton({ icon, label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={`p-1 rounded hover:bg-surface-container-low ${active ? "text-primary" : ""}`}
        >
            <span
                className="material-symbols-outlined text-[16px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
                {icon}
            </span>
        </button>
    );
}

function Avatar({ error = false }) {
    return (
        <span
            className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                error ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
            }`}
        >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
        </span>
    );
}

function Thinking({ t }) {
    return (
        <div className="flex gap-3 items-center" aria-live="polite">
            <Avatar />
            <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant flex items-center gap-2">
                <span className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                </span>
                {t("planner.chat.thinking")}
            </div>
        </div>
    );
}

export default AiPlanner;
