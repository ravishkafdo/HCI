require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const setupAdminUser = require("./config/setupAdmin");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined");
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

// Database connection
connectDB().then(() => {
  // Set up default admin user after DB connection
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    setupAdminUser();
  }
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Set up static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directories exist
const fs = require('fs');
const uploadDirs = ['uploads', 'uploads/images', 'uploads/models'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join admin room for real-time updates
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log(`${socket.id} joined admin room`);
  });
  
  // Notify when product is created/updated/deleted
  socket.on('product-update', (data) => {
    io.to('admin-room').emit('product-updated', data);
    io.emit('catalog-updated', { message: 'Product catalog has been updated' });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JWT_SECRET loaded: ${!!process.env.JWT_SECRET}`);
});
