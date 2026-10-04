import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../common/UserAvatar";
import FormAlert from "../common/FormAlert";
import { createComment, deleteComment, fetchComments, updateComment } from "../../services/postService";
import { formatDateTime } from "../../utils/formatters";
import { useT } from "../../i18n/I18nContext";

/** Từ tầng này trở đi trả lời không thụt lề thêm (tránh cây quá sâu trên màn hình nhỏ). */
const MAX_INDENT_DEPTH = 3;
const inputClass = "w-full rounded-lg border-outline-variant/40 bg-surface-container-lowest text-sm";

/** Dựng cây từ danh sách phẳng (BE trả theo thời gian tăng dần). */
function buildTree(comments) {
    const nodes = new Map(comments.map((c) => [c.id, { ...c, replies: [] }]));
    const roots = [];
    nodes.forEach((node) => {
        const parent = node.parentId && nodes.get(node.parentId);
        if (parent) parent.replies.push(node);
        else roots.push(node);
    });
    return roots;
}

function CommentBox({ initial = "", placeholder, submitLabel, onSubmit, onCancel, autoFocus }) {
    const t = useT();
    const [text, setText] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSaving(true);
        setError("");
        try {
            await onSubmit(text.trim());
            setText("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <FormAlert>{error}</FormAlert>
            <textarea
                rows={2}
                maxLength={2000}
                autoFocus={autoFocus}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
            />
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-high">
                        {t("common.actions.cancel")}
                    </button>
                )}
                <button type="submit" disabled={saving || !text.trim()} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary disabled:opacity-50">
                    {saving ? t("reviews.comments.sending") : submitLabel}
                </button>
            </div>
        </form>
    );
}

function CommentNode({ node, depth, userId, canReply, onReply, onEdit, onDelete }) {
    const t = useT();
    const [mode, setMode] = useState(null); // "reply" | "edit"
    const visible = node.status === "active";
    const isMine = visible && userId && node.authorId === userId;

    return (
        <li>
            <div className="flex gap-3">
                {visible ? (
                    <UserAvatar user={{ fullName: node.authorName, avatarUrl: node.authorAvatar }} size="w-8 h-8" textSize="text-xs" rounded="rounded-full" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    {visible ? (
                        <>
                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <span className="font-bold text-sm">{node.authorName}</span>
                                <span className="text-[11px] text-on-surface-variant">
                                    {formatDateTime(node.createdAt)}
                                    {node.isEdited && ` · ${t("reviews.comments.edited")}`}
                                </span>
                            </div>
                            {mode === "edit" ? (
                                <div className="mt-2">
                                    <CommentBox
                                        initial={node.content}
                                        submitLabel={t("common.actions.save")}
                                        autoFocus
                                        onSubmit={async (text) => {
                                            await onEdit(node.id, text);
                                            setMode(null);
                                        }}
                                        onCancel={() => setMode(null)}
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-on-surface whitespace-pre-line break-words mt-0.5">{node.content}</p>
                            )}
                            <div className="flex gap-4 mt-1 text-xs font-bold text-on-surface-variant">
                                {canReply && (
                                    <button type="button" onClick={() => setMode(mode === "reply" ? null : "reply")} className="hover:text-primary">
                                        {t("common.actions.reply")}
                                    </button>
                                )}
                                {isMine && mode !== "edit" && (
                                    <button type="button" onClick={() => setMode("edit")} className="hover:text-primary">
                                        {t("common.actions.edit")}
                                    </button>
                                )}
                                {isMine && (
                                    <button
                                        type="button"
                                        onClick={() => window.confirm(t("reviews.comments.deleteConfirm")) && onDelete(node.id)}
                                        className="hover:text-red-600"
                                    >
                                        {t("common.actions.delete")}
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm italic text-on-surface-variant py-1">{t("reviews.comments.removed")}</p>
                    )}
                    {mode === "reply" && (
                        <div className="mt-2">
                            <CommentBox
                                placeholder={t("reviews.comments.replyPlaceholder", { name: node.authorName })}
                                submitLabel={t("common.actions.reply")}
                                autoFocus
                                onSubmit={async (text) => {
                                    await onReply(node.id, text);
                                    setMode(null);
                                }}
                                onCancel={() => setMode(null)}
                            />
                        </div>
                    )}
                </div>
            </div>
            {node.replies.length > 0 && (
                <ul className={`mt-3 space-y-3 ${depth < MAX_INDENT_DEPTH ? "ml-11 border-l border-outline-variant/30 pl-4" : ""}`}>
                    {node.replies.map((child) => (
                        <CommentNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            userId={userId}
                            canReply={canReply}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

/** Bình luận nhiều tầng của một bài. onCountChange(n) báo số bình luận đang hiển thị cho PostCard. */
function CommentThread({ postId, onCountChange }) {
    const t = useT();
    const { user, isLoggedIn } = useAuth();
    const location = useLocation();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setError("");
        try {
            const data = await fetchComments(postId);
            setComments(data);
            onCountChange?.(data.filter((c) => c.status === "active").length);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [postId, onCountChange]);

    useEffect(() => {
        load();
    }, [load]);

    const tree = useMemo(() => buildTree(comments), [comments]);

    // Sau mỗi thao tác tải lại cả danh sách: BE quyết định bình luận nào bị ẩn / lược bỏ.
    const handleReply = async (parentId, content) => {
        await createComment(postId, { content, parentId });
        await load();
    };
    const handleEdit = async (commentId, content) => {
        await updateComment(commentId, content);
        await load();
    };
    const handleDelete = async (commentId) => {
        try {
            await deleteComment(commentId);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-4">
            <FormAlert>{error}</FormAlert>
            {isLoggedIn ? (
                <CommentBox placeholder={t("reviews.comments.writePlaceholder")} submitLabel={t("reviews.comments.comment")} onSubmit={(text) => handleReply(null, text)} />
            ) : (
                <p className="text-xs text-on-surface-variant">
                    <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`} className="font-bold text-primary hover:underline">{t("reviews.comments.signIn")}</Link>{t("reviews.comments.joinConversation")}
                </p>
            )}
            {loading ? (
                <p className="text-xs text-on-surface-variant">{t("reviews.comments.loading")}</p>
            ) : tree.length === 0 ? (
                <p className="text-xs text-on-surface-variant">{t("reviews.comments.empty")}</p>
            ) : (
                <ul className="space-y-4">
                    {tree.map((node) => (
                        <CommentNode
                            key={node.id}
                            node={node}
                            depth={1}
                            userId={user?.id}
                            canReply={isLoggedIn}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CommentThread;
