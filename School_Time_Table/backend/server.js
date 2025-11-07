const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
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
// Root route
app.get("/", (req, res) => {
  res.json({
    message: "School Time Table API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});
//

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 MongoDB URL defined: ${!!process.env.MONGODB_URL}`);
});
