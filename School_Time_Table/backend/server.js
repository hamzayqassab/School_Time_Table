const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/database");
const scheduleController = require("./controllers/scheduleController.js");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/v1/teachers", require("./routes/teachers"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/classrooms", require("./routes/classrooms"));
app.use("/api/v1/schedules", require("./routes/schedules"));
app.patch("/api/v1/schedules/:id", scheduleController.updateSchedule);

// Frontend static files
const frontendPath = path.join(__dirname, "../frontend");
const indexPath = path.join(frontendPath, "index.html");
app.use(express.static(frontendPath));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running", 
    database: "connected",
    frontend: fs.existsSync(frontendPath)
  });
});

// TEMPORARY: Seed route - REMOVE AFTER USE
app.post("/api/seed", async (req, res) => {
  try {
    const seedScript = require("./data/seed.js"); // Adjust path if needed
    await seedScript();
    res.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all: serve frontend for all unmatched GET routes (SPA support)
app.get("/*", (req, res) => {
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Frontend path: ${frontendPath}`);
  console.log(`📄 Index.html exists: ${fs.existsSync(indexPath)}`);
});
