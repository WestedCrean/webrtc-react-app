const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
    const socketProxy = createProxyMiddleware('/foo/bar', {
        target: 'http://localhost:5050',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug',
    });

    app.use(socketProxy);
};