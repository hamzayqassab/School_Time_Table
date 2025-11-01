const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    course_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    description: String,
    credits: Number,
    department: String,
    can_joint_teach: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
