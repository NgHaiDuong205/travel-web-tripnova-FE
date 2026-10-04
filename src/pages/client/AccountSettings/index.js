import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import FormAlert from "../../../components/common/FormAlert";
import UserAvatar from "../../../components/common/UserAvatar";
import { useAuth } from "../../../context/AuthContext";
import { changeMyPassword, fetchMyProfile, updateMyProfile } from "../../../services/meService";
import { useT } from "../../../i18n/I18nContext";

const fieldClass =
    "w-full bg-surface-container-lowest border-b-2 border-transparent focus:border-primary-fixed-dim focus:ring-0 px-3 py-2 transition-all text-sm rounded";
const labelClass = "text-[0.7rem] uppercase tracking-wider font-bold text-on-surface-variant";

function AccountSettings() {
    const t = useT();
    const navigate = useNavigate();
    const { user, refreshUser, logout } = useAuth();
    const [profile, setProfile] = useState({ fullName: "", phone: "", dateOfBirth: "", gender: "", avatarUrl: "" });
    const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
    const [savingProfile, setSavingProfile] = useState(false);

    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        fetchMyProfile()
            .then((p) =>
                setProfile({
                    fullName: p.fullName ?? "",
                    phone: p.phone ?? "",
                    dateOfBirth: p.dateOfBirth ?? "",
                    gender: p.gender ?? "",
                    avatarUrl: p.avatarUrl ?? "",
                })
            )
            .catch((err) => setProfileMsg({ type: "error", text: err.message }));
    }, []);

    const handleProfileChange = (e) => {
        setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setProfileMsg({ type: "", text: "" });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profile.fullName.trim()) {
            setProfileMsg({ type: "error", text: t("account.settings.validation.fullNameRequired") });
            return;
        }
        setSavingProfile(true);
        try {
            await updateMyProfile({
                fullName: profile.fullName.trim(),
                phone: profile.phone.trim(),
                dateOfBirth: profile.dateOfBirth || null,
                gender: profile.gender,
                avatarUrl: profile.avatarUrl.trim(),
            });
            await refreshUser();
            setProfileMsg({ type: "success", text: t("account.settings.profileSaved") });
        } catch (err) {
            setProfileMsg({ type: "error", text: err.message });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setPasswordMsg({ type: "", text: "" });
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword.length < 6) {
            setPasswordMsg({ type: "error", text: t("account.settings.validation.passwordMinLength") });
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordMsg({ type: "error", text: t("account.settings.validation.passwordMismatch") });
            return;
        }
        setSavingPassword(true);
        try {
            await changeMyPassword(passwords.currentPassword, passwords.newPassword);
            // Backend thu hồi mọi phiên đăng nhập -> đăng nhập lại bằng mật khẩu mới.
            await logout();
            navigate("/login", { replace: true });
        } catch (err) {
            setPasswordMsg({ type: "error", text: err.message });
            setSavingPassword(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary mb-2">{t("nav.sidebar.accountSettings")}</h1>
                    <p className="text-on-surface-variant">{t("account.settings.subtitle")}</p>
                </div>

                <div className="space-y-10">
                    <form onSubmit={handleSaveProfile} className="bg-surface-container-low p-8 rounded-xl" noValidate>
                        <div className="flex items-center gap-2 mb-8">
                            <span className="material-symbols-outlined text-primary">person</span>
                            <h2 className="font-headline text-xl font-bold">{t("account.settings.profileDetails")}</h2>
                        </div>
                        <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                            <UserAvatar user={{ ...user, ...profile }} size="w-24 h-24" textSize="text-3xl" rounded="rounded-xl" />
                            <div className="flex-1 w-full space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="space-y-1 block">
                                        <span className={labelClass}>{t("common.fields.fullName")}</span>
                                        <input className={fieldClass} name="fullName" value={profile.fullName} onChange={handleProfileChange} />
                                    </label>
                                    <label className="space-y-1 block">
                                        <span className={labelClass}>{t("account.settings.emailAddress")}</span>
                                        <input className={`${fieldClass} opacity-60`} value={user?.email ?? ""} disabled />
                                    </label>
                                    <label className="space-y-1 block">
                                        <span className={labelClass}>{t("common.fields.phone")}</span>
                                        <input className={fieldClass} name="phone" value={profile.phone} onChange={handleProfileChange} />
                                    </label>
                                    <label className="space-y-1 block">
                                        <span className={labelClass}>{t("account.settings.dateOfBirth")}</span>
                                        <input className={fieldClass} type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleProfileChange} />
                                    </label>
                                    <label className="space-y-1 block">
                                        <span className={labelClass}>{t("account.settings.gender")}</span>
                                        <select className={fieldClass} name="gender" value={profile.gender} onChange={handleProfileChange}>
                                            <option value="">{t("account.settings.genderOptions.preferNotToSay")}</option>
                                            <option value="male">{t("account.settings.genderOptions.male")}</option>
                                            <option value="female">{t("account.settings.genderOptions.female")}</option>
                                            <option value="other">{t("account.settings.genderOptions.other")}</option>
                                        </select>
                                    </label>
                                    <label className="space-y-1 block">
                                        <span className={labelClass}>{t("account.settings.avatarUrl")}</span>
                                        <input className={fieldClass} name="avatarUrl" value={profile.avatarUrl} onChange={handleProfileChange} placeholder="https://..." />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <FormAlert type={profileMsg.type}>{profileMsg.text}</FormAlert>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="text-white px-6 py-3 rounded-lg font-bold text-sm disabled:opacity-60"
                                    style={{ background: "linear-gradient(135deg, #002155 0%, #003580 100%)" }}
                                >
                                    {savingProfile ? t("common.state.saving") : t("account.settings.saveProfileChanges")}
                                </button>
                            </div>
                        </div>
                    </form>

                    <form onSubmit={handleSavePassword} className="bg-surface-container-low p-8 rounded-xl" noValidate>
                        <div className="flex items-center gap-2 mb-8">
                            <span className="material-symbols-outlined text-primary">security</span>
                            <h2 className="font-headline text-xl font-bold">{t("account.settings.changePassword")}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <label className="space-y-1 block">
                                <span className={labelClass}>{t("account.settings.currentPassword")}</span>
                                <input className={fieldClass} type="password" name="currentPassword" autoComplete="current-password" value={passwords.currentPassword} onChange={handlePasswordChange} />
                            </label>
                            <label className="space-y-1 block">
                                <span className={labelClass}>{t("account.settings.newPassword")}</span>
                                <input className={fieldClass} type="password" name="newPassword" autoComplete="new-password" value={passwords.newPassword} onChange={handlePasswordChange} />
                            </label>
                            <label className="space-y-1 block">
                                <span className={labelClass}>{t("account.settings.confirmNewPassword")}</span>
                                <input className={fieldClass} type="password" name="confirmPassword" autoComplete="new-password" value={passwords.confirmPassword} onChange={handlePasswordChange} />
                            </label>
                        </div>
                        <div className="space-y-4">
                            <FormAlert type={passwordMsg.type}>{passwordMsg.text}</FormAlert>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-on-surface-variant">{t("account.settings.passwordChangeNotice")}</p>
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm disabled:opacity-60"
                                >
                                    {savingPassword ? t("account.settings.updating") : t("account.settings.updatePassword")}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="h-24"></div>
        </DashboardLayout>
    );
}

export default AccountSettings;
