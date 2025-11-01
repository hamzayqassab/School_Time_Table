const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: String,
    subjects: [String],
    assigned_classrooms: [String],
    grade_levels: [String],
    availability: {
      monday: [String],
      tuesday: [String],
      wednesday: [String],
      thursday: [String],
      friday: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
