import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useT } from "../../i18n/I18nContext";

// Phần tử trong <main> được "hiện dần" khi cuộn tới: khối lớn + từng ô trong lưới (so le).
const REVEAL_SELECTOR = "main section, main article, main .grid > *";
const MAX_STAGGER = 6;
const STAGGER_MS = 70;
const LAUNCHER_KEY = "tripnova.chatLauncher";
// Thẻ có ảnh nghiêng 3D theo con trỏ (chỉ chuột/bút, không áp cho khối quá lớn).
const TILT_SELECTOR = "main article.rounded-xl, main article.rounded-2xl, main a.rounded-xl, main a.rounded-2xl, main a.rounded-3xl";
const TILT_MAX_DEG = 6;
const TILT_MAX_WIDTH = 720;
const MAGNET_MAX_PX = 10;

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Hiệu ứng chung cho site khách (gắn cùng ChatWidget trong AppRouter, không chạy ở admin/manager):
 * chuyển trang mờ dần, hiện dần khi cuộn (kể cả nội dung tải sau), thanh tiến trình cuộn, header đổ bóng khi cuộn,
 * gợn sóng tại điểm bấm, nút lên đầu trang, thẻ nghiêng 3D theo con trỏ, nút "nam châm" (data-magnetic),
 * ảnh hiện dần khi tải xong. CSS ở index.css (.tn-fx …). Tắt khi người dùng bật giảm chuyển động.
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

    // Chuyển trang: nội dung mờ dần hiện lên (bỏ qua khi PageTransitions đang chạy view transition — đã có hiệu ứng riêng).
    useEffect(() => {
        if (prefersReducedMotion() || document.documentElement.classList.contains("tn-vt")) return;
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

        // Ảnh chưa tải xong lúc gắn vào trang → hiện dần khi tải xong (ảnh có sẵn trong cache thì hiện ngay, không nháy).
        const onImgLoad = (event) => {
            const img = event.currentTarget;
            img.classList.add("tn-img-in");
            img.addEventListener("animationend", () => img.classList.remove("tn-img-in"), { once: true });
        };
        const scanImages = () => {
            document.querySelectorAll("main img:not([data-tn-img])").forEach((img) => {
                img.dataset.tnImg = "1";
                if (!img.complete) img.addEventListener("load", onImgLoad, { once: true });
            });
        };

        const scan = () => {
            scanImages();
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

    // Thẻ nghiêng 3D + vệt sáng theo con trỏ; nút data-magnetic nhích theo con trỏ. Một listener, gộp theo khung hình.
    useEffect(() => {
        const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
        if (prefersReducedMotion() || !finePointer) return undefined;
        let card = null;
        let magnet = null;
        let frame = 0;
        let last = null;

        const canTilt = (el) => {
            if (el.dataset.tnTilt) return el.dataset.tnTilt === "1";
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            // transform sẵn có (VD hover:scale) → bỏ qua để không đè
            const ok = Boolean(el.querySelector("img")) && rect.width <= TILT_MAX_WIDTH && rect.height > 120 && style.transform === "none";
            el.dataset.tnTilt = ok ? "1" : "0";
            if (ok && style.position === "static") el.classList.add("tn-tilt-pos");
            return ok;
        };
        const releaseCard = () => {
            if (!card) return;
            const el = card;
            card = null;
            el.classList.add("tn-tilt-leave");
            el.style.setProperty("--tn-rx", "0deg");
            el.style.setProperty("--tn-ry", "0deg");
            el.style.setProperty("--tn-glare", "0");
            window.setTimeout(() => {
                if (el !== card) el.classList.remove("tn-tilt", "tn-tilt-leave");
            }, 600);
        };
        const releaseMagnet = () => {
            if (magnet) magnet.style.translate = "";
            magnet = null;
        };

        const update = () => {
            frame = 0;
            if (!last) return;
            const { x, y, target } = last;
            const nextCard = target.closest?.(TILT_SELECTOR) || null;
            if (nextCard !== card) {
                releaseCard();
                if (nextCard && canTilt(nextCard)) {
                    card = nextCard;
                    card.classList.remove("tn-tilt-leave");
                    card.classList.add("tn-tilt");
                }
            }
            if (card) {
                const rect = card.getBoundingClientRect();
                const px = Math.min(1, Math.max(0, (x - rect.left) / rect.width));
                const py = Math.min(1, Math.max(0, (y - rect.top) / rect.height));
                card.style.setProperty("--tn-rx", `${((0.5 - py) * 2 * TILT_MAX_DEG).toFixed(2)}deg`);
                card.style.setProperty("--tn-ry", `${((px - 0.5) * 2 * TILT_MAX_DEG).toFixed(2)}deg`);
                card.style.setProperty("--tn-gx", `${(px * 100).toFixed(1)}%`);
                card.style.setProperty("--tn-gy", `${(py * 100).toFixed(1)}%`);
                card.style.setProperty("--tn-glare", "1");
            }

            const nextMagnet = target.closest?.("[data-magnetic]") || null;
            if (nextMagnet !== magnet) releaseMagnet();
            magnet = nextMagnet;
            if (magnet) {
                const rect = magnet.getBoundingClientRect();
                const dx = ((x - rect.left) / rect.width - 0.5) * 2; // -1..1
                const dy = ((y - rect.top) / rect.height - 0.5) * 2;
                magnet.style.translate = `${(dx * MAGNET_MAX_PX).toFixed(1)}px ${(dy * MAGNET_MAX_PX * 0.7).toFixed(1)}px`;
            }
        };
        const onMove = (event) => {
            if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
            last = { x: event.clientX, y: event.clientY, target: event.target };
            if (!frame) frame = window.requestAnimationFrame(update);
        };
        const onLeave = () => {
            last = null;
            releaseCard();
            releaseMagnet();
        };
        document.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        window.addEventListener("blur", onLeave);
        return () => {
            document.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("blur", onLeave);
            if (frame) window.cancelAnimationFrame(frame);
            onLeave();
        };
    }, []);

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
