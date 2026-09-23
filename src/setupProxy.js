const { createProxyMiddleware } = require("http-proxy-middleware");

/** Dự phòng: proxy /api khi baseURL rỗng (cùng origin :3000) */
module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "http://localhost:8080",
            changeOrigin: true,
            secure: false,
        })
    );
};
