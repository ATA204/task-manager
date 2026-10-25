const crypto = require("crypto");

// Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set on the project.
// Without CRON_SECRET on the server, every call is refused.
const cronAuth = (req, res, next) => {
    const secret = process.env.CRON_SECRET;
    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(req.headers.authorization || "");

    // timingSafeEqual needs two buffers of the same length
    const isValid =
        Boolean(secret) &&
        expected.length === received.length &&
        crypto.timingSafeEqual(expected, received);

    if (!isValid) {
        return res.status(401).json({ message: "Not Authorized" });
    }
    next();
};

module.exports = { cronAuth };
