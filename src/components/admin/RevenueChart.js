import { useState } from "react";
import { formatDate, formatMoney } from "../../utils/formatters";

const BAR_COLOR = "#003580";
const HEIGHT = 200;

/**
 * Cột doanh thu theo ngày (1 chuỗi, 1 màu — không cần chú giải).
 * Hover cột để xem tooltip; bảng số liệu nằm trong <details> cho người không đọc được biểu đồ.
 */
function RevenueChart({ points, currency, emptyText = "Chưa có doanh thu trong 30 ngày qua" }) {
    const [hover, setHover] = useState(null);
    const max = Math.max(...points.map((p) => Number(p.revenue)), 0);
    const hasData = max > 0;

    return (
        <div>
            <div className="relative" style={{ height: HEIGHT + 28 }} onMouseLeave={() => setHover(null)}>
                {/* Đường nền 0 */}
                <div className="absolute left-0 right-0 border-t border-gray-200" style={{ top: HEIGHT }} />
                {!hasData && (
                    <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400" style={{ height: HEIGHT }}>
                        {emptyText}
                    </p>
                )}
                <div className="absolute inset-x-0 top-0 flex items-end gap-[2px]" style={{ height: HEIGHT }}>
                    {points.map((p, i) => {
                        const value = Number(p.revenue);
                        const barHeight = hasData ? Math.max(value > 0 ? 3 : 0, (value / max) * (HEIGHT - 16)) : 0;
                        return (
                            <div
                                key={p.date}
                                className="flex-1 h-full flex items-end cursor-default"
                                onMouseEnter={() => setHover(i)}
                            >
                                <div
                                    className="w-full rounded-t"
                                    style={{
                                        height: barHeight,
                                        background: BAR_COLOR,
                                        opacity: hover == null || hover === i ? 1 : 0.45,
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
                {/* Nhãn trục x: ngày đầu / giữa / cuối */}
                <div className="absolute left-0 right-0 flex justify-between text-[11px] text-gray-500" style={{ top: HEIGHT + 8 }}>
                    <span>{formatDate(points[0]?.date)}</span>
                    <span>{formatDate(points[Math.floor(points.length / 2)]?.date)}</span>
                    <span>{formatDate(points[points.length - 1]?.date)}</span>
                </div>
                {hover != null && (
                    <div
                        className="absolute z-10 -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-xs pointer-events-none whitespace-nowrap"
                        style={{ left: `${((hover + 0.5) / points.length) * 100}%`, top: 0 }}
                    >
                        <p className="text-gray-500">{formatDate(points[hover].date)}</p>
                        <p className="font-bold text-gray-900">{formatMoney(points[hover].revenue, currency)}</p>
                        <p className="text-gray-500">{points[hover].transactions} transactions</p>
                    </div>
                )}
            </div>
            <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-gray-500 font-semibold">Xem bảng số liệu</summary>
                <table className="mt-2 w-full text-left">
                    <thead>
                        <tr className="text-xs uppercase text-gray-500">
                            <th className="py-1">Date</th>
                            <th className="py-1 text-right">Revenue</th>
                            <th className="py-1 text-right">Transactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {points.filter((p) => Number(p.revenue) > 0).map((p) => (
                            <tr key={p.date} className="border-t border-gray-100">
                                <td className="py-1">{formatDate(p.date)}</td>
                                <td className="py-1 text-right">{formatMoney(p.revenue, currency)}</td>
                                <td className="py-1 text-right">{p.transactions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </div>
    );
}

export default RevenueChart;
