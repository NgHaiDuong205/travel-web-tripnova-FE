import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const HERO = "tn-hero";
const HERO_WAIT_MS = 700;
const COMMIT_TIMEOUT_MS = 1500; // + HERO_WAIT_MS, phải dưới giới hạn ~4s của trình duyệt

const supported = () =>
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Link nội bộ cần chuyển cảnh (không phải tab mới, link ngoài, tải file, cùng trang, bấm vào nút nằm trong link). */
function transitionTarget(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
    const anchor = event.target.closest?.("a[href]");
    if (!anchor || anchor.closest("[data-no-transition]")) return null;
    const control = event.target.closest("button, input, select, textarea, label, [role='button']");
    if (control && anchor.contains(control)) return null; // VD nút tim trong thẻ khách sạn
    if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return null;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return null;
    return { anchor, to: url.pathname + url.search + url.hash, hash: Boolean(url.hash) };
}

/** Ảnh trên thẻ được bấm (để "bay" sang ảnh lớn của trang mới). */
function cardImage(anchor) {
    const img = anchor.querySelector("img");
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 60 && rect.height > 40;
    return visible ? img : null;
}

/** Ảnh lớn đầu trang mới: ảnh to nhất trong <main> nằm ở màn hình đầu, rộng ≥ 30% vùng nội dung, đã tải xong. */
function heroImage() {
    const main = document.querySelector("main");
    if (!main) return null;
    const mainWidth = main.getBoundingClientRect().width;
    let best = null;
    let bestArea = 0;
    main.querySelectorAll("img").forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.8 || rect.width < mainWidth * 0.3) return;
        const area = rect.width * rect.height;
        if (area > bestArea) {
            best = img;
            bestArea = area;
        }
    });
    return best && best.complete && best.naturalWidth > 0 ? best : null;
}

// Trong lúc view transition cập nhật DOM, trình duyệt tạm dừng vẽ → requestAnimationFrame không chạy: dùng setTimeout.
function waitForHero() {
    return new Promise((resolve) => {
        const started = performance.now();
        const tick = () => {
            const img = heroImage();
            if (img || performance.now() - started > HERO_WAIT_MS) resolve(img);
            else window.setTimeout(tick, 30);
        };
        tick();
    });
}

/**
 * Chuyển cảnh giữa các trang site khách bằng View Transitions API: trang cũ mờ + thu nhẹ, trang mới trượt lên,
 * header đứng yên; ảnh trên thẻ được bấm "bay" thành ảnh lớn của trang chi tiết. CSS ở index.css (::view-transition-*).
 * Trình duyệt không hỗ trợ / giảm chuyển động → để React Router điều hướng như cũ (SiteEffects vẫn mờ dần trang mới).
 * Chỉ chặn điều hướng mặc định (preventDefault), không stopPropagation → onClick riêng của Link vẫn chạy.
 */
function PageTransitions() {
    const navigate = useNavigate();
    const location = useLocation();
    const committed = useRef(null); // resolve() khi trang mới đã render

    useLayoutEffect(() => {
        committed.current?.();
        committed.current = null;
    }, [location.key]);

    useEffect(() => {
        if (!supported()) return undefined;
        const onClick = (event) => {
            const target = transitionTarget(event);
            if (!target || document.documentElement.classList.contains("tn-vt")) return;
            event.preventDefault();

            const fromImg = cardImage(target.anchor);
            if (fromImg) fromImg.style.viewTransitionName = HERO;
            document.documentElement.classList.add("tn-vt");
            let toImg = null;

            const transition = document.startViewTransition(async () => {
                if (fromImg) fromImg.style.viewTransitionName = ""; // ảnh cũ đã chụp xong, tránh trùng tên
                await new Promise((resolve) => {
                    committed.current = resolve;
                    navigate(target.to);
                    window.setTimeout(resolve, COMMIT_TIMEOUT_MS);
                });
                if (!target.hash) window.scrollTo(0, 0);
                if (fromImg) {
                    toImg = await waitForHero();
                    if (toImg) toImg.style.viewTransitionName = HERO;
                }
            });
            // Chuyển cảnh bị bỏ qua (VD điều hướng khác chen vào) → promise reject: không coi là lỗi.
            transition.ready.catch(() => {});
            transition.updateCallbackDone.catch(() => {});
            transition.finished
                .catch(() => {})
                .finally(() => {
                    if (fromImg) fromImg.style.viewTransitionName = "";
                    if (toImg) toImg.style.viewTransitionName = "";
                    document.documentElement.classList.remove("tn-vt");
                });
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, [navigate]);

    return null;
}

export default PageTransitions;
