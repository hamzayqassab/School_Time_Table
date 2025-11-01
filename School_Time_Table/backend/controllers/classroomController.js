const Classroom = require("../models/classroom.js");

// GET all classrooms (optionally filtered by grade or section)
exports.getAllClassrooms = async (req, res) => {
  try {
    const { grade, section } = req.query;
    let filter = {};
    if (grade) filter.grade = grade;
    if (section) filter.section = section.toUpperCase();
    const classrooms = await Classroom.find(filter);
    res.json({
      success: true,
      count: classrooms.length,
      data: classrooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET single classroom
exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findOne({ classroom_id: req.params.id });
    if (!classroom) {
      return res
        .status(404)
        .json({ success: false, error: "Classroom not found" });
    }
    res.json({ success: true, data: classroom });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST create classroom
exports.createClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.create(req.body);
    res.status(201).json({ success: true, data: classroom });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// PUT update classroom
exports.updateClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findOneAndUpdate(
      { classroom_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!classroom) {
      return res
        .status(404)
        .json({ success: false, error: "Classroom not found" });
    }
    res.json({ success: true, data: classroom });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE classroom
exports.deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findOneAndDelete({
      classroom_id: req.params.id,
    });
    if (!classroom) {
      return res
        .status(404)
        .json({ success: false, error: "Classroom not found" });
    }
    res.json({ success: true, message: "Classroom deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
