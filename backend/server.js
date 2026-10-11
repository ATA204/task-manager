require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes")
const notificationRoutes = require("./models/Notification")
const http = require("http");
const { initSocket } = require("./appSocket");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
connectDB();

//Routes
app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/report", reportRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/uploads", express.static(path.join(__dirname, 'uploads')))


const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 8000;

httpServer.listen(PORT,()=>{
  console.log(`server (API + socket) is running on port ${PORT}`);
  
})



