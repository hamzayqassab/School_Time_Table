const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

router
  .route("/")
  .get(scheduleController.getAllSchedules)
  .post(scheduleController.createSchedule);

router
  .route("/:id")
  .put(scheduleController.updateSchedule)
  .delete(scheduleController.deleteSchedule);
router.patch("/:id", scheduleController.updateSchedule);

// POST /api/v1/schedules/shuffle
router.post("/shuffle", scheduleController.shuffleSchedule);

module.exports = router;

