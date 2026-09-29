import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import UserAvatar from "../../../components/common/UserAvatar";
import { useAuth } from "../../../context/AuthContext";
import {
    IMAGE_ACCEPT,
    OAUTH_PROVIDERS,
    changeEmail,
    createLinkToken,
    deleteAccount,
    fetchLinkedAccounts,
    fetchOAuthProviders,
    oauthAuthorizeUrl,
    removeAvatar,
    resendVerification,
    unlinkAccount,
    uploadAvatar,
    validateImageFile,
} from "../../../services/accountService";
import { formatDateTime } from "../../../utils/formatters";

const cardClass = "bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6";
const inputClass = "w-full border border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-container-lowest";
const primaryButton = "px-4 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary disabled:opacity-50";
const ghostButton =
    "px-4 py-2 rounded-lg text-sm font-bold border border-outline-variant/40 hover:bg-surface-container-high disabled:opacity-50";

function SectionTitle({ icon, title, subtitle }) {
    return (
        <div className="flex items-start gap-3 mb-5">
            <span className="material-symbols-outlined text-primary mt-0.5">{icon}</span>
            <div>
                <h2 className="font-headline text-xl font-bold">{title}</h2>
                {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
            </div>
        </div>
    );
}

/** Ảnh đại diện: tải ảnh lên (≤ 5 MB) hoặc gỡ. */
function AvatarSection({ user, onUpdated }) {
    const fileRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const run = async (action) => {
        setBusy(true);
        setError("");
        try {
            await action();
            await onUpdated();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        const problem = validateImageFile(file);
        if (problem) {
            setError(problem);
            return;
        }
        run(() => uploadAvatar(file));
    };

    return (
        <section className={cardClass}>
            <SectionTitle icon="account_circle" title="Profile photo" subtitle="JPEG, PNG, GIF or WEBP, up to 5 MB." />
            <FormAlert>{error}</FormAlert>
            <div className="flex flex-wrap items-center gap-6">
                <UserAvatar user={user} size="w-24 h-24" textSize="text-2xl" rounded="rounded-full" />
                <div className="flex gap-3">
                    <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={handleFile} />
                    <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={primaryButton}>
                        {busy ? "Saving..." : user?.avatarUrl ? "Change photo" : "Upload photo"}
                    </button>
                    {user?.avatarUrl && (
                        <button type="button" disabled={busy} onClick={() => run(removeAvatar)} className={ghostButton}>
                            Remove
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

/** Trạng thái xác thực email + đổi email (cần mật khẩu hiện tại). */
function EmailSection({ user, onUpdated }) {
    const [form, setForm] = useState({ newEmail: "", currentPassword: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const handleResend = async () => {
        setBusy(true);
        setError("");
        setNotice("");
        try {
            await resendVerification();
            setNotice(`We sent a new verification link to ${user.email}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleChange = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setNotice("");
        try {
            const updated = await changeEmail(form.newEmail.trim(), form.currentPassword);
            setForm({ newEmail: "", currentPassword: "" });
            setNotice(`Your email is now ${updated.email}. Check that inbox for a verification link.`);
            await onUpdated();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className={cardClass}>
            <SectionTitle icon="mail" title="Email address" subtitle="Used to sign in and to receive booking confirmations." />
            <FormAlert type="success">{notice}</FormAlert>
            <FormAlert>{error}</FormAlert>
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="font-bold">{user?.email}</span>
                {user?.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Verified
                    </span>
                ) : (
                    <>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Not verified
                        </span>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={handleResend}
                            className="text-sm font-bold text-primary hover:underline disabled:opacity-50"
                        >
                            Resend verification link
                        </button>
                    </>
                )}
            </div>
            <form onSubmit={handleChange} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <label className="text-xs font-semibold text-on-surface-variant">
                    New email
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={form.newEmail}
                        onChange={(e) => setForm((prev) => ({ ...prev, newEmail: e.target.value }))}
                        className={`${inputClass} mt-1`}
                    />
                </label>
                <label className="text-xs font-semibold text-on-surface-variant">
                    Current password
                    <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={form.currentPassword}
                        onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className={`${inputClass} mt-1`}
                    />
                </label>
                <button type="submit" disabled={busy || !form.newEmail.trim() || !form.currentPassword} className={primaryButton}>
                    Change email
                </button>
            </form>
        </section>
    );
}

/** Tài khoản mạng xã hội đã liên kết; nút "Connect" chỉ hiện với provider BE đã cấu hình. */
function ConnectedAccountsSection({ linkedProvider }) {
    const [providers, setProviders] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    const load = useCallback(
        () =>
            Promise.all([fetchOAuthProviders().catch(() => []), fetchLinkedAccounts()])
                .then(([enabled, linked]) => {
                    setProviders(enabled);
                    setAccounts(linked);
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false)),
        [],
    );

    useEffect(() => {
        load();
    }, [load]);

    const connect = async (provider) => {
        setBusy(provider);
        setError("");
        try {
            const token = await createLinkToken();
            window.location.assign(oauthAuthorizeUrl(provider, token));
        } catch (err) {
            setError(err.message);
            setBusy("");
        }
    };

    const disconnect = async (provider) => {
        if (!window.confirm(`Disconnect ${OAUTH_PROVIDERS[provider]?.label || provider}?`)) return;
        setBusy(provider);
        setError("");
        try {
            await unlinkAccount(provider);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    };

    const rows = [...new Set([...providers, ...accounts.map((a) => a.provider)])];

    return (
        <section className={cardClass}>
            <SectionTitle
                icon="link"
                title="Connected accounts"
                subtitle="Sign in faster with a social account linked to this profile."
            />
            <FormAlert type="success">
                {linkedProvider ? `${OAUTH_PROVIDERS[linkedProvider]?.label || linkedProvider} account connected.` : ""}
            </FormAlert>
            <FormAlert>{error}</FormAlert>
            {loading ? (
                <div className="h-16 rounded-lg bg-surface-container-high animate-pulse" />
            ) : rows.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Social sign-in is not available yet.</p>
            ) : (
                <ul className="divide-y divide-outline-variant/20">
                    {rows.map((provider) => {
                        const meta = OAUTH_PROVIDERS[provider] || { label: provider, icon: "?", className: "bg-gray-200" };
                        const account = accounts.find((a) => a.provider === provider);
                        return (
                            <li key={provider} className="flex flex-wrap items-center gap-4 py-4">
                                <span
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${meta.className}`}
                                >
                                    {meta.icon}
                                </span>
                                <div className="flex-1 min-w-[160px]">
                                    <p className="font-bold">{meta.label}</p>
                                    <p className="text-xs text-on-surface-variant">
                                        {account
                                            ? `${account.displayName || account.email || "Connected"}${account.linkedAt ? ` · since ${formatDateTime(account.linkedAt)}` : ""}`
                                            : "Not connected"}
                                    </p>
                                </div>
                                {account ? (
                                    <button
                                        type="button"
                                        disabled={busy === provider}
                                        onClick={() => disconnect(provider)}
                                        className={ghostButton}
                                    >
                                        Disconnect
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={busy === provider}
                                        onClick={() => connect(provider)}
                                        className={primaryButton}
                                    >
                                        {busy === provider ? "Redirecting..." : "Connect"}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

/** Xoá (mềm) tài khoản: cần mật khẩu + gõ DELETE; BE chặn khi còn đơn chưa kết thúc. */
function DeleteAccountSection({ onDeleted }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            await deleteAccount(password);
            onDeleted();
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <section className="rounded-xl border border-red-200 bg-red-50/40 p-6">
            <div className="flex items-start gap-3 mb-5">
                <span className="material-symbols-outlined text-red-600 mt-0.5">warning</span>
                <div>
                    <h2 className="font-headline text-xl font-bold text-red-700">Delete account</h2>
                    <p className="text-sm text-on-surface-variant">
                        Your profile will be closed and you will be signed out everywhere. Cancel or finish open bookings first.
                    </p>
                </div>
            </div>
            <FormAlert>{error}</FormAlert>
            <form onSubmit={handleDelete} className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <label className="text-xs font-semibold text-on-surface-variant">
                    Password
                    <input
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} mt-1`}
                    />
                </label>
                <label className="text-xs font-semibold text-on-surface-variant">
                    Type DELETE to confirm
                    <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${inputClass} mt-1`} />
                </label>
                <button
                    type="submit"
                    disabled={busy || !password || confirm !== "DELETE"}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white disabled:opacity-50"
                >
                    {busy ? "Deleting..." : "Delete account"}
                </button>
            </form>
        </section>
    );
}

/** Trang "Login & Security": ảnh đại diện, email + xác thực, liên kết mạng xã hội, xoá tài khoản. */
function LoginSecurity() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, refreshUser, logout } = useAuth();

    const handleDeleted = async () => {
        try {
            await logout();
        } catch {
            /* token đã bị thu hồi — chỉ cần xoá phía client */
        }
        navigate("/", { replace: true });
    };

    return (
        <DashboardLayout>
            <section className="mb-10">
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-2 block">
                    Account
                </span>
                <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-2">Login & Security</h1>
                <p className="text-on-surface-variant text-lg">
                    Manage your photo, email, connected accounts and account removal.
                </p>
            </section>
            <div className="space-y-6">
                <AvatarSection user={user} onUpdated={refreshUser} />
                <EmailSection user={user} onUpdated={refreshUser} />
                <ConnectedAccountsSection linkedProvider={searchParams.get("linked")} />
                <DeleteAccountSection onDeleted={handleDeleted} />
            </div>
        </DashboardLayout>
    );
}

export default LoginSecurity;
