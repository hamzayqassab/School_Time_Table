const express = require("express");
const router = express.Router();
const classroomController = require("../controllers/classroomController");

router
  .route("/")
  .get(classroomController.getAllClassrooms)
  .post(classroomController.createClassroom);

router
  .route("/:id")
  .get(classroomController.getClassroomById)
  .put(classroomController.updateClassroom)
  .delete(classroomController.deleteClassroom);

module.exports = router;
