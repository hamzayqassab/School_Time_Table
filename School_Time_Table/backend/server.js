const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/database");
const scheduleController = require("./controllers/scheduleController.js");
const seedScript = require("./data/seed.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/teachers", require("./routes/teachers"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/classrooms", require("./routes/classrooms"));
app.use("/api/v1/schedules", require("./routes/schedules"));
app.patch("/api/v1/schedules/:id", scheduleController.updateSchedule);

const frontendPath = path.join(__dirname, "frontend");
const indexPath = path.join(frontendPath, "index.html");
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    database: "connected",
    frontend: fs.existsSync(frontendPath)
  });
});

app.get("/:splat", (req, res) => {
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => seedScript())
  .then(() => {
    console.log("Database seeded on startup");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend path: ${frontendPath}`);
      console.log(`Index.html exists: ${fs.existsSync(indexPath)}`);
    });
  })
  .catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
  });
