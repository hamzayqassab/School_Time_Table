const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema(
  {
    classroom_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    capacity: Number,
    building: String,
    floor: Number,
    facilities: [String],
    students_count: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Classroom", classroomSchema);
