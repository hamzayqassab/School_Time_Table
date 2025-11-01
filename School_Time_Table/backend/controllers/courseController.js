const Course = require("../models/course.js");

// GET all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET single course
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ course_id: req.params.id });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST create course
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// PUT update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { course_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ course_id: req.params.id });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
