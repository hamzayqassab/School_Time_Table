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
module.exports = router;
