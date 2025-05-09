require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const setupAdminUser = require("./config/setupAdmin");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const roomDesignRoutes = require("./routes/roomDesigns");
const { createServer } = require("http");
const { Server } = require("socket.io");

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined");
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

connectDB().then(() => {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    setupAdminUser();
  }
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const fs = require('fs');
const uploadDirs = ['uploads', 'uploads/images', 'uploads/models'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/room-designs", roomDesignRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log(`${socket.id} joined admin room`);
  });
  
  socket.on('product-update', (data) => {
    io.to('admin-room').emit('product-updated', data);
    io.emit('catalog-updated', { message: 'Product catalog has been updated' });
  });

  socket.on('design-update', (data) => {
    io.emit('design-updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

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
