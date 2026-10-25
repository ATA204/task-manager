require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { getCorsOrigin } = require("./config/cors");
const { ensureDB } = require("./middlewares/dbMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const cronRoutes = require("./routes/cronRoutes");
const imageRoutes = require("./routes/imageRoutes");
const http = require("http");
const { initSocket } = require("./appSocket");
const { startTaskReminderJob } = require("./controllers/taskRemindeers");

const app = express();

// Vercel and Render put a proxy in front of the app.
// Trusting it makes req.protocol "https", so upload URLs are https too.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: getCorsOrigin(),
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

//Routes
app.get("/", (req, res) => {
  res.send("API is working");
});

// Mounted before ensureDB: a call without the right CRON_SECRET never opens a DB connection
app.use("/api/cron", cronRoutes);

// Every other API route waits for MongoDB first
app.use("/api", ensureDB);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/report", reportRoutes)
app.use("/api/notifications", notificationRoutes);

// Old images saved on disk (local only), then images stored in MongoDB
app.use("/uploads", express.static(path.join(__dirname, 'uploads')))
app.use("/uploads", imageRoutes);

// Any error that reaches here gets a JSON answer instead of Express's HTML page
app.use((err, req, res, next) => {
  console.error({ message: "Unhandled error", error: err.message });
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: status < 500 ? err.message : "Server Error" });
});

// `node server.js` / `npm run dev`: a long-running server with Socket.io and the hourly reminder job.
// On Vercel, api/index.js only imports `app`, so none of this runs there.
if (require.main === module) {
  connectDB().catch((error) => {
    console.error(`connection Error ${error.message}`);
  });

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  const PORT = process.env.PORT || 8000;

  httpServer.listen(PORT, () => {
    console.log(`server (API + socket) is running on port ${PORT}`);
    startTaskReminderJob();
  });
}

module.exports = app;
