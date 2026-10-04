import { useEffect, useRef, useState } from "react";

export const LAUNCHER_SIZE = 56;
export const EDGE_MARGIN = 16;
const DRAG_THRESHOLD = 6;
const POSITION_KEY = "tripnova.chatLauncher";

/** body có `zoom` (index.css): toạ độ chuột là px màn hình, vị trí CSS là px đã zoom → chia cho zoom. */
function bodyZoom() {
    return parseFloat(window.getComputedStyle(document.body).zoom) || 1;
}

export function viewportCss() {
    const zoom = bodyZoom();
    return { w: window.innerWidth / zoom, h: window.innerHeight / zoom, zoom, mobile: window.innerWidth < 640 };
}

function bottomReserve(vp) {
    // Điện thoại có thanh menu dưới (DashboardLayout) cao 64px.
    return vp.w * vp.zoom < 768 ? 80 : 24;
}

function clampTop(top, vp) {
    return Math.min(Math.max(top, EDGE_MARGIN), vp.h - LAUNCHER_SIZE - bottomReserve(vp));
}

function readPosition() {
    try {
        const saved = JSON.parse(localStorage.getItem(POSITION_KEY));
        if (saved && (saved.side === "left" || saved.side === "right") && typeof saved.yRatio === "number") return saved;
    } catch {
        /* bỏ qua */
    }
    return null;
}

/** Vị trí nút (px CSS) theo phía bám + tỉ lệ chiều cao đã lưu; mặc định góc dưới phải. */
export function resolvePosition(saved, vp) {
    const side = saved?.side || "right";
    const top = saved ? clampTop(saved.yRatio * vp.h, vp) : vp.h - LAUNCHER_SIZE - bottomReserve(vp);
    const left = side === "left" ? EDGE_MARGIN : vp.w - LAUNCHER_SIZE - EDGE_MARGIN;
    return { side, left, top: clampTop(top, vp) };
}

/**
 * Nút trợ lý AI tròn, kéo thả được (chuột + cảm ứng), thả ra tự bám mép trái/phải gần nhất và nhớ vị trí.
 * Khi khung chat đang đóng: hiện bong bóng chào (gõ chữ dần), bấm vào bong bóng để mở chat.
 */
function ChatLauncher({ open, onToggle, onPositionChange, greeting, showGreeting, onDismissGreeting, labels }) {
    const [vp, setVp] = useState(viewportCss);
    const [saved, setSaved] = useState(readPosition);
    const [drag, setDrag] = useState(null); // {left, top} khi đang kéo
    const dragRef = useRef(null);
    const resting = resolvePosition(saved, vp);
    const pos = drag || resting;

    useEffect(() => {
        const onResize = () => setVp(viewportCss());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        onPositionChange?.({ side: drag ? (pos.left + LAUNCHER_SIZE / 2 < vp.w / 2 ? "left" : "right") : resting.side, left: pos.left, top: pos.top, vp });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pos.left, pos.top, resting.side, vp.w, vp.h]);

    const onPointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        dragRef.current = { x: event.clientX, y: event.clientY, left: pos.left, top: pos.top, moved: false };
    };

    const onPointerMove = (event) => {
        const start = dragRef.current;
        if (!start) return;
        const dx = (event.clientX - start.x) / vp.zoom;
        const dy = (event.clientY - start.y) / vp.zoom;
        if (!start.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        start.moved = true;
        setDrag({
            left: Math.min(Math.max(start.left + dx, EDGE_MARGIN), vp.w - LAUNCHER_SIZE - EDGE_MARGIN),
            top: clampTop(start.top + dy, vp),
        });
    };

    const onPointerUp = () => {
        const start = dragRef.current;
        dragRef.current = null;
        if (!start) return;
        if (!start.moved) {
            onToggle();
            return;
        }
        const current = drag || pos;
        const next = {
            side: current.left + LAUNCHER_SIZE / 2 < vp.w / 2 ? "left" : "right",
            yRatio: current.top / vp.h,
        };
        setSaved(next);
        setDrag(null);
        try {
            localStorage.setItem(POSITION_KEY, JSON.stringify(next));
        } catch {
            /* bỏ qua */
        }
    };

    const onKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
        }
    };

    const side = drag ? (pos.left + LAUNCHER_SIZE / 2 < vp.w / 2 ? "left" : "right") : resting.side;
    const bubbleVisible = showGreeting && !drag && !open;

    return (
        <>
            {bubbleVisible && (
                <Greeting
                    text={greeting}
                    side={side}
                    left={pos.left}
                    top={pos.top}
                    mobile={vp.mobile}
                    onOpen={onToggle}
                    onDismiss={onDismissGreeting}
                    dismissLabel={labels.dismiss}
                />
            )}
            <div
                className={`fixed z-[71] ${open ? "hidden sm:block" : ""} ${!open && !drag ? "tn-float" : ""}`}
                style={{
                    left: pos.left,
                    top: pos.top,
                    width: LAUNCHER_SIZE,
                    height: LAUNCHER_SIZE,
                    transition: drag ? "none" : "left 0.45s cubic-bezier(.34,1.56,.64,1), top 0.45s cubic-bezier(.34,1.56,.64,1)",
                }}
            >
                {!open && !drag && <span className="tn-launcher-ping" aria-hidden="true" />}
                <button
                    type="button"
                    data-testid="chat-launcher"
                    aria-label={open ? labels.close : labels.open}
                    aria-expanded={open}
                    title={`${open ? labels.close : labels.open} · ${labels.drag}`}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={() => {
                        dragRef.current = null;
                        setDrag(null);
                    }}
                    onKeyDown={onKeyDown}
                    style={{ touchAction: "none" }}
                    className={`tn-launcher relative h-full w-full rounded-full text-white shadow-xl ring-4 ring-white/80 flex items-center justify-center select-none ${
                        drag ? "tn-launcher-dragging cursor-grabbing" : "cursor-grab"
                    }`}
                >
                    <span className={`material-symbols-outlined text-[28px] ${open ? "" : "tn-bot-icon"}`}>
                        {open ? "close" : "smart_toy"}
                    </span>
                    {!open && (
                        <span className="tn-ai-badge absolute -top-1 -right-1 rounded-full px-1.5 text-[9px] font-extrabold leading-4">
                            AI
                        </span>
                    )}
                </button>
            </div>
        </>
    );
}

function Greeting({ text, side, left, top, mobile, onOpen, onDismiss, dismissLabel }) {
    const [shown, setShown] = useState(0);

    useEffect(() => {
        setShown(0);
        const timer = window.setInterval(() => {
            setShown((n) => {
                if (n >= text.length) {
                    window.clearInterval(timer);
                    return n;
                }
                return n + 1;
            });
        }, 32);
        return () => window.clearInterval(timer);
    }, [text]);

    const width = mobile ? 210 : 250;
    const style =
        side === "right"
            ? { left: Math.max(EDGE_MARGIN, left - width - 14), top: top + LAUNCHER_SIZE / 2 }
            : { left: left + LAUNCHER_SIZE + 14, top: top + LAUNCHER_SIZE / 2 };
    const typing = shown < text.length;

    return (
        <div
            data-testid="chat-greeting"
            className={`tn-greeting fixed z-[71] -translate-y-1/2 ${side === "right" ? "tn-greeting-right" : "tn-greeting-left"}`}
            style={{ ...style, width }}
        >
            <div className="relative rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 pr-8 text-sm text-on-surface shadow-xl">
                <button type="button" onClick={onOpen} className="block w-full text-left">
                    <span className="whitespace-pre-line">{text.slice(0, shown)}</span>
                    {typing && <span className="tn-caret" aria-hidden="true" />}
                </button>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label={dismissLabel}
                    title={dismissLabel}
                    className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full text-on-surface-variant hover:bg-surface-container-low flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
                <span
                    aria-hidden="true"
                    className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-outline-variant/40 bg-white ${
                        side === "right" ? "-right-1.5 border-r border-t" : "-left-1.5 border-l border-b"
                    }`}
                />
            </div>
        </div>
    );
}

export default ChatLauncher;
