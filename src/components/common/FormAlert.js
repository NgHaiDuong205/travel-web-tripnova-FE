/** Hộp thông báo lỗi / thành công cho form. */
function FormAlert({ type = "error", children }) {
    if (!children) return null;
    const styles =
        type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-600 border-red-200";
    return <div className={`p-3 rounded-lg text-sm font-medium border ${styles}`}>{children}</div>;
}

export default FormAlert;
