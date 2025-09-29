// server.js
require("dotenv").config();

require("./firebase-admin");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./routes/userRoute");
const menusRoutes = require("./routes/menusRoute");
const orderRoutes = require("./routes/orderRoute");
const pendingActionRoute = require("./routes/pendingActionRoute");

const dashboardRoutes = require("./routes/dashboardRoute");
const authRoutes = require("./routes/authRoute");
const manageConfigRoutes = require("./routes/manageConfigRoute");
const waiterRoutes = require("./routes/waiterRoute");
const fcmRoutes = require("./routes/fcmRoute");
const permissionMiddleware = require("./middleware/permissionMiddleware");
const inventoryRoutes = require("./routes/inventoryRoute");
const superAdminRoutes = require("./routes/superAdminRoute");

const prodUI = "https://indian-delights.netlify.app";
// const devUI = "http://localhost:3000";
const devUI = "epiqr-restaurants.netlify.app";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: devUI,
    // origin: prodUI,
    methods: ["GET", "POST", "PUT"],
  },
});

// Middleware
// app.use(cors());
app.use(bodyParser.json());

// Make io accessible in routes
app.set("io", io);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: [devUI, prodUI],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/menus", menusRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/manageconfig", manageConfigRoutes);
app.use("/api/waiters", waiterRoutes);
app.use("/api/fcm", fcmRoutes);
app.use("/api/pending-actions", pendingActionRoute);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/superadmin", superAdminRoutes);

// MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

