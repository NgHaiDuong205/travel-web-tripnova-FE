import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useT } from "../../i18n/I18nContext";

// Phần tử trong <main> được "hiện dần" khi cuộn tới: khối lớn + từng ô trong lưới (so le).
const REVEAL_SELECTOR = "main section, main article, main .grid > *";
const MAX_STAGGER = 6;
const STAGGER_MS = 70;
const LAUNCHER_KEY = "tripnova.chatLauncher";

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Hiệu ứng chung cho site khách (gắn cùng ChatWidget trong AppRouter, không chạy ở admin/manager):
 * chuyển trang mờ dần, hiện dần khi cuộn (kể cả nội dung tải sau), thanh tiến trình cuộn, header đổ bóng khi cuộn,
 * gợn sóng tại điểm bấm, nút lên đầu trang. CSS ở index.css (.tn-fx …). Tắt khi người dùng bật giảm chuyển động.
 */
function SiteEffects() {
    const t = useT();
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [showTop, setShowTop] = useState(false);
    const [topSide, setTopSide] = useState("left");
    const ioRef = useRef(null);

    // Bật class gốc cho CSS hover/khung, gỡ khi rời site khách.
    useEffect(() => {
        document.body.classList.add("tn-fx");
        return () => document.body.classList.remove("tn-fx", "tn-scrolled");
    }, []);

    // Chuyển trang: nội dung mờ dần hiện lên.
    useEffect(() => {
        if (prefersReducedMotion()) return;
        const main = document.querySelector("main");
        if (!main) return;
        main.classList.remove("tn-page-in");
        void main.offsetWidth; // chạy lại animation
        main.classList.add("tn-page-in");
    }, [location.pathname]);

    // Hiện dần khi cuộn tới; MutationObserver bắt nội dung tải sau (danh sách từ API).
    useEffect(() => {
        if (prefersReducedMotion() || !("IntersectionObserver" in window)) return undefined;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("tn-revealed");
                    io.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
        );
        ioRef.current = io;

        const scan = () => {
            document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
                if (el.dataset.tnReveal || el.closest(".tn-no-reveal, [data-testid='chat-widget']")) return;
                const style = window.getComputedStyle(el);
                if (style.position === "fixed" || style.position === "sticky" || style.display === "contents") return;
                el.dataset.tnReveal = "1";
                if (el.parentElement?.classList.contains("grid")) {
                    const index = Array.prototype.indexOf.call(el.parentElement.children, el);
                    el.style.setProperty("--tn-delay", `${(index % MAX_STAGGER) * STAGGER_MS}ms`);
                }
                el.classList.add("tn-reveal");
                io.observe(el);
            });
        };

        let frame = 0;
        const schedule = () => {
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
                frame = 0;
                scan();
            });
        };
        scan();
        const mo = new MutationObserver(schedule);
        const root = document.getElementById("root") || document.body;
        mo.observe(root, { childList: true, subtree: true });
        return () => {
            mo.disconnect();
            io.disconnect();
            if (frame) window.cancelAnimationFrame(frame);
            // Observer đã ngắt: trả phần tử chưa hiện về bình thường, nếu không sẽ kẹt ẩn
            // (StrictMode chạy effect 2 lần; lần quét sau bỏ qua phần tử đã đánh dấu).
            document.querySelectorAll("[data-tn-reveal]").forEach((el) => {
                if (el.classList.contains("tn-revealed")) return;
                el.classList.remove("tn-reveal");
                delete el.dataset.tnReveal;
            });
        };
    }, []);

    // Thanh tiến trình cuộn + header đổ bóng + nút lên đầu trang.
    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const y = window.scrollY;
            setProgress(max > 0 ? Math.min(1, y / max) : 0);
            setShowTop(y > 700);
            document.body.classList.toggle("tn-scrolled", y > 12);
        };
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, [location.pathname]);

    // Nút lên đầu trang đặt phía đối diện nút trợ lý AI (nút AI kéo được, vị trí lưu ở localStorage).
    useEffect(() => {
        if (!showTop) return;
        try {
            const saved = JSON.parse(localStorage.getItem(LAUNCHER_KEY));
            setTopSide(saved?.side === "left" ? "right" : "left");
        } catch {
            setTopSide("left");
        }
    }, [showTop]);

    // Gợn sóng tại điểm bấm nút / link (lớp phủ cố định, không đụng bố cục của nút).
    useEffect(() => {
        if (prefersReducedMotion()) return undefined;
        const zoom = parseFloat(window.getComputedStyle(document.body).zoom) || 1;
        const onClick = (event) => {
            if (event.button !== 0 || !event.target.closest?.("button, a, [role='button']")) return;
            const dot = document.createElement("span");
            dot.className = "tn-click-ripple";
            dot.style.left = `${event.clientX / zoom}px`;
            dot.style.top = `${event.clientY / zoom}px`;
            document.body.appendChild(dot);
            window.setTimeout(() => dot.remove(), 650);
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);

    return (
        <>
            <div className="tn-scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
            <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}
                aria-label={t("common.actions.backToTop")}
                title={t("common.actions.backToTop")}
                data-testid="back-to-top"
                className={`tn-back-top fixed bottom-24 md:bottom-6 z-[65] h-11 w-11 rounded-full bg-white text-primary shadow-lg border border-outline-variant/40 flex items-center justify-center ${
                    topSide === "left" ? "left-4 md:left-6" : "right-4 md:right-6"
                } ${showTop ? "tn-back-top-visible" : ""}`}
                tabIndex={showTop ? 0 : -1}
            >
                <span className="material-symbols-outlined">arrow_upward</span>
            </button>
        </>
    );
}

export default SiteEffects;
