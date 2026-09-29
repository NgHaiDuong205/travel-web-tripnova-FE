import apiClient from "../config/axiosConfig";

/** Get a filename from response headers. */
export function fileNameFromHeaders(headers, fallback) {
    const contentDisposition = headers?.["content-disposition"];
    const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    return match ? decodeURIComponent(match[1]) : fallback;
}

/** Save a blob to the device. */
export function saveBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Download a file. */
export async function downloadFile(url) {
    const response = await apiClient.get(url, { responseType: "blob" });
    saveBlob(response.data, fileNameFromHeaders(response.headers, "download.pdf"));
}
