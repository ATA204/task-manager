// CLIENT_URL can hold one or more frontend origins, separated by commas:
// CLIENT_URL=https://my-app.vercel.app,http://localhost:5173
// Trailing slashes are removed because browsers send the Origin header without one.
const parseOrigins = (value = "") =>
    value
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean);

// Used by both Express (cors) and Socket.io. No CLIENT_URL means "*" (any origin).
const getCorsOrigin = () => {
    const origins = parseOrigins(process.env.CLIENT_URL);
    return origins.length > 0 ? origins : "*";
};

module.exports = { parseOrigins, getCorsOrigin };
