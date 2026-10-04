import { useId } from "react";

/** Ô nhập liệu có nhãn — dùng chung cho form Auth / Account. Nhãn gắn với ô qua htmlFor (tự sinh id nếu không truyền). */
function FormInput({ label, error, className = "", id, ...inputProps }) {
    const autoId = useId();
    const inputId = id || autoId;
    return (
        <div className={className}>
            {label && <label htmlFor={inputId} className="block text-sm font-bold text-gray-700 mb-2">{label}</label>}
            <input
                id={inputId}
                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border focus:bg-white focus:ring-4 transition-all outline-none ${
                    error
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-gray-200 focus:border-[#003580] focus:ring-[#003580]/10"
                }`}
                {...inputProps}
            />
            {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

export default FormInput;
