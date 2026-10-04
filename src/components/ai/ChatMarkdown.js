import { Link } from "react-router-dom";
import { safeRedirect } from "../../utils/authRedirect";

/**
 * Markdown tối giản cho câu trả lời của trợ lý AI, dựng thành phần tử React (không dùng innerHTML):
 * đoạn văn, gạch đầu dòng (- * •), danh sách số, **đậm**, *nghiêng*, [chữ](/đường-dẫn-nội-bộ), nhãn nguồn [DB] / [TL1].
 * Link chỉ nhận đường dẫn nội bộ (bắt đầu "/") — link ngoài hiển thị như chữ thường.
 */
const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|\[(DB|TL\d+)\]/g;

function renderInline(text, onCitation, keyPrefix) {
    const out = [];
    let last = 0;
    let match;
    INLINE.lastIndex = 0;
    while ((match = INLINE.exec(text)) !== null) {
        if (match.index > last) out.push(text.slice(last, match.index));
        const key = `${keyPrefix}-${match.index}`;
        if (match[1] !== undefined) {
            const href = safeRedirect(match[2]);
            out.push(
                href ? (
                    <Link key={key} to={href} className="font-semibold text-primary underline underline-offset-2 hover:opacity-80">
                        {match[1]}
                    </Link>
                ) : (
                    <span key={key}>{match[1]}</span>
                )
            );
        } else if (match[3] !== undefined) {
            out.push(<strong key={key}>{match[3]}</strong>);
        } else if (match[4] !== undefined) {
            out.push(<em key={key}>{match[4]}</em>);
        } else {
            const tag = match[5];
            const isDoc = tag !== "DB";
            out.push(
                <button
                    key={key}
                    type="button"
                    disabled={!isDoc || !onCitation}
                    onClick={() => isDoc && onCitation?.(tag)}
                    className={`mx-0.5 inline-flex items-center rounded px-1 py-px align-baseline text-[10px] font-bold ${
                        isDoc
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            : "bg-blue-50 text-blue-700 cursor-default"
                    }`}
                >
                    {tag}
                </button>
            );
        }
        last = INLINE.lastIndex;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

function ChatMarkdown({ text, onCitation }) {
    const blocks = [];
    let list = null;
    const flush = () => {
        if (list) {
            blocks.push(list);
            list = null;
        }
    };
    (text || "").split(/\r?\n/).forEach((raw, i) => {
        const line = raw.trimEnd();
        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
        if (bullet || numbered) {
            const ordered = !!numbered;
            if (!list || list.ordered !== ordered) {
                flush();
                list = { type: "list", ordered, items: [] };
            }
            list.items.push(bullet ? bullet[1] : numbered[2]);
            return;
        }
        flush();
        if (line.trim() === "") return;
        const heading = line.match(/^#{1,4}\s+(.*)$/);
        blocks.push({ type: heading ? "heading" : "p", text: heading ? heading[1] : line, key: i });
    });
    flush();

    return (
        <div className="space-y-2 text-sm leading-relaxed">
            {blocks.map((block, bi) => {
                if (block.type === "list") {
                    const Tag = block.ordered ? "ol" : "ul";
                    return (
                        <Tag key={bi} className={`${block.ordered ? "list-decimal" : "list-disc"} space-y-1 pl-5`}>
                            {block.items.map((item, ii) => (
                                <li key={ii}>{renderInline(item, onCitation, `${bi}-${ii}`)}</li>
                            ))}
                        </Tag>
                    );
                }
                if (block.type === "heading") {
                    return (
                        <p key={bi} className="font-bold">
                            {renderInline(block.text, onCitation, `${bi}`)}
                        </p>
                    );
                }
                return <p key={bi}>{renderInline(block.text, onCitation, `${bi}`)}</p>;
            })}
        </div>
    );
}

export default ChatMarkdown;
