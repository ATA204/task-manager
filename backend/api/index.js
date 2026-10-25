// Vercel entry point: every request is rewritten here (see vercel.json).
// server.js exports the Express app and skips listen(), Socket.io and the
// setInterval reminder job when it is imported instead of run directly.
const app = require("../server");

module.exports = app;
