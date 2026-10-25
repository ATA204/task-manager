const connectDB = require("../config/db");

// Waits for MongoDB before the request reaches a controller.
// If the database can't be reached, answer with JSON instead of crashing.
const ensureDB = async (req, res, next) => {
    try {
        await connectDB();
    } catch (error) {
        console.error({ message: "[db] connection failed", error: error.message });
        return res.status(500).json({ message: "Database connection failed" });
    }
    next();
};

module.exports = { ensureDB };
