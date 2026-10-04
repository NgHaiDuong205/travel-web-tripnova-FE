import { useEffect, useState } from "react";
import FormAlert from "../../../components/common/FormAlert";
import { useAuth } from "../../../context/AuthContext";
import { changeMyPassword, fetchMyProfile, updateMyProfile } from "../../../services/meService";
import { useT } from "../../../i18n/I18nContext";

const inputClass = "block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";
const EMPTY_PASSWORDS = { current: "", next: "", confirm: "" };

/**
 * Tài khoản của người quản lý khách sạn (thay cho các trang hồ sơ của khách — tài khoản khách sạn không vào được).
 * Tài khoản do admin tạo, thường với mật khẩu tạm → nhắc đổi mật khẩu ở đây.
 */
function ManagerAccount() {
    const t = useT();
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ fullName: "", phone: "" });
    const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
    const [savingProfile, setSavingProfile] = useState(false);
    const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
    const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        fetchMyProfile()
            .then((data) => {
                setProfile(data);
                setForm({ fullName: data.fullName || "", phone: data.phone || "" });
            })
            .catch((err) => setProfileMsg({ type: "error", text: err.message }));
    }, []);

    const saveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMsg({ type: "", text: "" });
        try {
            // PUT thay toàn bộ hồ sơ: giữ nguyên các trường không sửa ở đây.
            const updated = await updateMyProfile({
                fullName: form.fullName.trim(),
                phone: form.phone.trim() || null,
                dateOfBirth: profile?.dateOfBirth || null,
                gender: profile?.gender || null,
                avatarUrl: profile?.avatarUrl || null,
            });
            setProfile(updated);
            await refreshUser();
            setProfileMsg({ type: "success", text: t("manager.account.profileSaved") });
        } catch (err) {
            setProfileMsg({ type: "error", text: err.details?.length ? err.details.join(" · ") : err.message });
        } finally {
            setSavingProfile(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        setPasswordMsg({ type: "", text: "" });
        if (passwords.next !== passwords.confirm) {
            setPasswordMsg({ type: "error", text: t("manager.account.passwordMismatch") });
            return;
        }
        setSavingPassword(true);
        try {
            await changeMyPassword(passwords.current, passwords.next);
            setPasswords(EMPTY_PASSWORDS);
            setPasswordMsg({ type: "success", text: t("manager.account.passwordChanged") });
        } catch (err) {
            setPasswordMsg({ type: "error", text: err.details?.length ? err.details.join(" · ") : err.message });
        } finally {
            setSavingPassword(false);
        }
    };

    const setPw = (name) => (e) => setPasswords((prev) => ({ ...prev, [name]: e.target.value }));

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-extrabold text-primary">{t("manager.account.title")}</h1>

            <form onSubmit={saveProfile} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">{t("manager.account.profile")}</h2>
                <label className="text-xs font-semibold text-gray-500 block">
                    {t("manager.account.emailLogin")}
                    <input value={user?.email || ""} disabled className={`${inputClass} bg-gray-50 text-gray-500`} />
                </label>
                <label className="text-xs font-semibold text-gray-500 block">
                    {t("common.fields.fullName")} *
                    <input
                        required
                        maxLength={255}
                        value={form.fullName}
                        onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className={inputClass}
                    />
                </label>
                <label className="text-xs font-semibold text-gray-500 block">
                    {t("common.fields.phone")}
                    <input
                        maxLength={20}
                        value={form.phone}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className={inputClass}
                    />
                </label>
                <FormAlert type={profileMsg.type || "error"}>{profileMsg.text}</FormAlert>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={savingProfile || !profile}
                        className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                        {savingProfile ? t("common.state.saving") : t("common.actions.save")}
                    </button>
                </div>
            </form>

            <form onSubmit={savePassword} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">{t("manager.account.changePassword")}</h2>
                <p className="text-sm text-gray-500 -mt-2">{t("manager.account.passwordAdvice")}</p>
                <label className="text-xs font-semibold text-gray-500 block">
                    {t("manager.account.currentPassword")} *
                    <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={passwords.current}
                        onChange={setPw("current")}
                        className={inputClass}
                    />
                </label>
                <label className="text-xs font-semibold text-gray-500 block">
                    {t("manager.account.newPassword")} *
                    <input
                        type="password"
                        required
                        minLength={8}
                        maxLength={100}
                        autoComplete="new-password"
                        value={passwords.next}
                        onChange={setPw("next")}
                        className={inputClass}
                    />
                </label>
                <label className="text-xs font-semibold text-gray-500 block">
                    {t("manager.account.confirmNewPassword")} *
                    <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={passwords.confirm}
                        onChange={setPw("confirm")}
                        className={inputClass}
                    />
                </label>
                <FormAlert type={passwordMsg.type || "error"}>{passwordMsg.text}</FormAlert>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                        {savingPassword ? t("common.state.saving") : t("manager.account.changePassword")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ManagerAccount;
