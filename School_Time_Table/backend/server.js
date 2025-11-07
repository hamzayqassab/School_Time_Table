const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); // ← ADD THIS LINE
const connectDB = require("./config/database");
const scheduleController = require("./controllers/scheduleController.js");
const { default: mongoose } = require("mongoose");

// Load environment variables
// dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files - try multiple possible locations

app.use(express.static(path.join(__dirname, "..", "frontend")));



// Routes
app.use("/api/v1/teachers", require("./routes/teachers"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/classrooms", require("./routes/classrooms"));
app.use("/api/v1/schedules", require("./routes/schedules"));
app.patch("/api/v1/schedules/:id", scheduleController.updateSchedule);

// Test route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});
//
// Add this route temporarily (remove after seeding)
app.post("/api/seed", async (req, res) => {
  try {
    // Import and run your seed script
    const seedScript = require("./data/seed.js"); // adjust path as needed
    await seedScript();
    res.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
//
// Root route
app.get("/", (req, res) => {
  res.json({
    message: "School Time Table API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});
//

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Catch-all handler for frontend routes (SPA support)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 MongoDB URL defined: ${!!process.env.MONGODB_URL}`);
});






