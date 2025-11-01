const Schedule = require("../models/schedule.js");
const Teacher = require("../models/teacher.js");

// Helper: Check if a time slot is within availability ranges
function isTimeInAvailability(timeStart, timeEnd, availableSlots) {
  for (const slot of availableSlots) {
    const [aStart, aEnd] = slot.split("-");
    if (timeStart >= aStart && timeEnd <= aEnd) return true;
  }
  return false;
}

// GET all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const { classroom_id, teacher_id, day } = req.query;
    let filter = {};
    if (classroom_id) filter.classroom_id = classroom_id;
    if (teacher_id) filter.teacher_ids = teacher_id;
    if (day) filter.day_of_week = day.toLowerCase();
    const schedules = await Schedule.find(filter);
    res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper: check time overlap
function timesOverlap(time1Start, time1End, time2Start, time2End) {
  return time1Start < time2End && time2Start < time1End;
}

// CREATE new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { teacher_ids, classroom_id, day_of_week, start_time, end_time } =
      req.body;

    // Always work with an array
    let teacher_list = Array.isArray(teacher_ids) ? teacher_ids : [teacher_ids];

    const allPossibleSlots = [
      "08:00-09:00",
      "09:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "12:00-13:00",
      "13:00-14:00",
      "14:00-15:00",
      "15:00-16:00",
    ];

    // Loop through ALL teacher_ids for checks!
    for (const tid of teacher_list) {
      const teacher = await Teacher.findOne({ teacher_id: tid });
      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, error: `Teacher not found (${tid})` });
      }

      const availableSlots =
        teacher.availability?.[day_of_week.toLowerCase()] || [];

      let fullyCovered = true;
      for (const slot of allPossibleSlots) {
        const [slotStart, slotEnd] = slot.split("-");
        if (start_time < slotEnd && end_time > slotStart) {
          if (!isTimeInAvailability(slotStart, slotEnd, availableSlots)) {
            fullyCovered = false;
            break;
          }
        }
      }

      if (!fullyCovered) {
        return res.status(409).json({
          success: false,
          error: `Teacher ${tid} is not available during all requested time`,
        });
      }

      const teacherConflict = await Schedule.findOne({
        teacher_ids: tid,
        day_of_week,
        $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
        schedule_id: { $ne: req.params.id },
      });

      if (teacherConflict) {
        return res.status(409).json({
          success: false,
          error: `Teacher ${tid} is already scheduled at this time`,
        });
      }
    }

    // Check if classroom already has a schedule at this time
    const classroomConflict = await Schedule.findOne({
      classroom_id,
      day_of_week,
      $or: [
        {
          start_time: { $lt: end_time },
          end_time: { $gt: start_time },
        },
      ],
      schedule_id: { $ne: req.params.id },
    });

    if (classroomConflict) {
      return res.status(409).json({
        success: false,
        error:
          "Classroom is already scheduled at this time for another course.",
      });
    }

    // If everything OK, create the schedule
    const schedule = await Schedule.create(req.body);
    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// UPDATE schedule
exports.updateSchedule = async (req, res) => {
  try {
    console.log("patch-sched-id", req.params.id);
    const schedule = await Schedule.findOneAndUpdate(
      { schedule_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: "Schedule not found",
      });
    }
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({
      schedule_id: req.params.id,
    });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: "Schedule not found",
      });
    }
    res.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// UPDATE/PATCH schedule
// exports.updateSchedule = async (req, res) => {
//   try {
//     const { classroom_id, day_of_week, start_time, end_time } = req.body;
//     const schedule = await Schedule.findOneAndUpdate(
//       { schedule_id: req.params.id },
//       {
//         classroom_id,
//         day_of_week,
//         start_time,
//         end_time,
//       },
//       { new: true }
//     );
//     if (!schedule) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Schedule not found" });
//     }
//     res.json({ success: true, data: schedule });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
exports.updateSchedule = async (req, res) => {
  try {
    const { teacher_ids, classroom_id, day_of_week, start_time, end_time } =
      req.body;
    let teacher_list = Array.isArray(teacher_ids) ? teacher_ids : [teacher_ids];
    const allPossibleSlots = [
      "08:00-09:00",
      "09:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "12:00-13:00",
      "13:00-14:00",
      "14:00-15:00",
      "15:00-16:00",
    ];

    // Validate teacher availability and double-booking
    for (const tid of teacher_list) {
      const teacher = await Teacher.findOne({ teacher_id: tid });
      if (!teacher)
        return res
          .status(404)
          .json({ success: false, error: `Teacher not found (${tid})` });

      const availableSlots =
        teacher.availability?.[day_of_week.toLowerCase()] || [];
      let fullyCovered = true;
      for (const slot of allPossibleSlots) {
        const [slotStart, slotEnd] = slot.split("-");
        if (start_time < slotEnd && end_time > slotStart) {
          if (!isTimeInAvailability(slotStart, slotEnd, availableSlots)) {
            fullyCovered = false;
            break;
          }
        }
      }
      if (!fullyCovered) {
        return res.status(409).json({
          success: false,
          error: `Teacher ${tid} is not available during all requested time`,
        });
      }

      // Teacher double booked
      const teacherConflict = await Schedule.findOne({
        teacher_ids: tid,
        day_of_week,
        $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
        schedule_id: { $ne: req.params.id }, // Exclude self
      });
      if (teacherConflict) {
        return res.status(409).json({
          success: false,
          error: `Teacher ${tid} is already scheduled at this time`,
        });
      }
    }

    // Classroom double booked
    const classroomConflict = await Schedule.findOne({
      classroom_id,
      day_of_week,
      $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
      schedule_id: { $ne: req.params.id }, // Exclude self
    });
    if (classroomConflict) {
      return res.status(409).json({
        success: false,
        error:
          "Classroom is already scheduled at this time for another course.",
      });
    }

    // If valid, perform update
    const schedule = await Schedule.findOneAndUpdate(
      { schedule_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, error: "Schedule not found" });
    }
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
