const mongoose = require("mongoose");

// One connection per process, kept on `global`.
// Vercel reuses a warm function between requests, so we don't reconnect every time.
const cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not set");
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
            .then((connection) => {
                console.log(`mongodb connected`);
                return connection;
            })
            .catch((error) => {
                cached.promise = null; // the next request tries again
                throw error;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = connectDB;
