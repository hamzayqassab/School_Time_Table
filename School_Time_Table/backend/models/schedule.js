const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    schedule_id: {
      type: String,
      required: true,
      unique: true,
    },
    classroom_id: {
      type: String,
      required: true,
      ref: "Classroom",
    },
    teacher_ids: [
      {
        type: String,
        required: true,
        ref: "Teacher",
      },
    ],
    grade: { type: String, required: true },
    course_id: {
      type: String,
      required: true,
      ref: "Course",
    },
    day_of_week: {
      type: String,
      required: true,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    date: Date,
    status: {
      type: String,
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
