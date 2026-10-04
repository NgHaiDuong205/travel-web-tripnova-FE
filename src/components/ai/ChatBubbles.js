import { useState } from "react";
import ChatMarkdown from "./ChatMarkdown";
import { formatDateTime } from "../../utils/formatters";

/** Bong bóng tin nhắn của trợ lý AI (dùng trong ChatWidget). Nhãn lấy từ namespace i18n `chatbot`. */

export function BotAvatar({ error = false, size = "h-7 w-7" }) {
    return (
        <span
            className={`shrink-0 ${size} rounded-full flex items-center justify-center ${
                error ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
            }`}
        >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
        </span>
    );
}

export function UserBubble({ message }) {
    return (
        <div className="flex justify-end">
            <div
                className={`max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-white whitespace-pre-wrap break-words ${
                    message.pending ? "opacity-70" : ""
                }`}
            >
                {message.content}
            </div>
        </div>
    );
}

export function AssistantBubble({ message, t, onRetry, onRate, busy, onLinkClick }) {
    const [openSource, setOpenSource] = useState(null);
    const sources = message.sources || [];
    const showSource = (citation) => setOpenSource((current) => (current === citation ? null : citation));

    if (message.isError) {
        return (
            <div className="flex gap-2">
                <BotAvatar error />
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <p>{message.content}</p>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={onRetry}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-bold underline disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                        {t("chatbot.retry")}
                    </button>
                </div>
            </div>
        );
    }

    const current = sources.find((s) => s.citation === openSource);
    return (
        <div className="flex gap-2" data-testid="assistant-message">
            <BotAvatar />
            <div className="max-w-[85%] min-w-0">
                <div className="rounded-2xl rounded-bl-sm bg-surface-container-low px-3 py-2 text-on-surface break-words" onClick={onLinkClick}>
                    <ChatMarkdown text={message.content} onCitation={sources.length ? showSource : undefined} />
                </div>
                {sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                        <span className="text-on-surface-variant">{t("chatbot.sources")}:</span>
                        {sources.map((s) => (
                            <button
                                key={s.citation}
                                type="button"
                                onClick={() => showSource(s.citation)}
                                title={s.title}
                                className={`max-w-[200px] truncate rounded-full border px-2 py-0.5 ${
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
                    <blockquote className="mt-1.5 max-h-40 overflow-y-auto rounded-lg border-l-4 border-amber-400 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-900 whitespace-pre-wrap">
                        {current.text}
                    </blockquote>
                )}
                <div className="mt-0.5 flex items-center gap-0.5 text-on-surface-variant">
                    <span className="text-[10px] mr-1">{formatDateTime(message.createdAt)}</span>
                    <FeedbackButton
                        icon="thumb_up"
                        label={t("chatbot.helpful")}
                        active={message.feedbackHelpful === true}
                        onClick={() => onRate(true)}
                    />
                    <FeedbackButton
                        icon="thumb_down"
                        label={t("chatbot.notHelpful")}
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
            className={`p-0.5 rounded hover:bg-surface-container-low ${active ? "text-primary" : ""}`}
        >
            <span
                className="material-symbols-outlined text-[14px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
                {icon}
            </span>
        </button>
    );
}

export function Thinking({ t }) {
    return (
        <div className="flex gap-2 items-center" aria-live="polite">
            <BotAvatar />
            <div className="rounded-2xl bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant flex items-center gap-2">
                <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                </span>
                {t("chatbot.thinking")}
            </div>
        </div>
    );
}
