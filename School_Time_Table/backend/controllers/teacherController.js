const Teacher = require("../models/teacher.js");

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ teacher_id: req.params.id });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, error: "Teacher not found" });
    }
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndUpdate(
      { teacher_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, error: "Teacher not found" });
    }
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndDelete({
      teacher_id: req.params.id,
    });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, error: "Teacher not found" });
    }
    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

