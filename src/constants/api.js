/** URL Spring Boot — luôn có giá trị mặc định, không phụ thuộc proxy CRA */
const envUrl = process.env.REACT_APP_API_BASE_URL?.trim();

export const API_BASE_URL = envUrl || "http://localhost:8080";
