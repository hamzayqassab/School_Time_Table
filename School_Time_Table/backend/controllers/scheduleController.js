const Schedule = require("../models/schedule.js");
const Teacher = require("../models/teacher.js");
const Classroom = require("../models/classroom.js");

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
//

// };
// exports.shuffleSchedules = async (_req, res) => {
//   console.log("[BACKEND] /schedules/shuffle endpoint hit.");
//   try {
//     const Teacher = require("../models/teacher.js");
//     const allSchedules = await Schedule.find({});
//     if (allSchedules.length < 2) {
//       return res.json({
//         success: true,
//         message: "Need at least 2 schedules to shuffle",
//       });
//     }
//     const allTeachers = await Teacher.find({});
//     const teacherMap = {};
//     allTeachers.forEach((t) => {
//       teacherMap[t.teacher_id] = t;
//     });

//     const teacherAvailableOnDay = (teacherId, day) => {
//       const teacher = teacherMap[teacherId];
//       if (!teacher || !teacher.availability) return false;
//       const dayAvailability = teacher.availability[day.toLowerCase()];
//       return Array.isArray(dayAvailability) && dayAvailability.length > 0;
//     };

//     // Double-booked teacher: teaching in 2 classrooms at same time
//     const isTeacherDoubleBooked = (
//       teacherId,
//       day,
//       start,
//       end,
//       ignoreScheduleId
//     ) => {
//       return allSchedules.some(
//         (s) =>
//           s._id.toString() !== ignoreScheduleId &&
//           s.teacher_ids.includes(teacherId) &&
//           s.day_of_week === day &&
//           s.start_time === start &&
//           s.end_time === end
//       );
//     };

//     // Double-booked classroom: more than 1 teacher in room at same time
//     const isClassroomDoubleBooked = (
//       classroomId,
//       day,
//       start,
//       end,
//       ignoreScheduleId
//     ) => {
//       return allSchedules.some(
//         (s) =>
//           s._id.toString() !== ignoreScheduleId &&
//           s.classroom_id === classroomId &&
//           s.day_of_week === day &&
//           s.start_time === start &&
//           s.end_time === end
//       );
//     };

//     // Swap only if there is NO teacher double-booking and NO classroom double-booking
//     const canSwap = (sched1, sched2) => {
//       const sched1TeachersOk = sched1.teacher_ids.every(
//         (tid) =>
//           teacherAvailableOnDay(tid, sched2.day_of_week) &&
//           !isTeacherDoubleBooked(
//             tid,
//             sched2.day_of_week,
//             sched2.start_time,
//             sched2.end_time,
//             sched2._id.toString()
//           )
//       );
//       const sched2TeachersOk = sched2.teacher_ids.every(
//         (tid) =>
//           teacherAvailableOnDay(tid, sched1.day_of_week) &&
//           !isTeacherDoubleBooked(
//             tid,
//             sched1.day_of_week,
//             sched1.start_time,
//             sched1.end_time,
//             sched1._id.toString()
//           )
//       );

//       const noClassroomDoubleBooking1 = !isClassroomDoubleBooked(
//         sched2.classroom_id,
//         sched2.day_of_week,
//         sched2.start_time,
//         sched2.end_time,
//         sched2._id.toString()
//       );

//       const noClassroomDoubleBooking2 = !isClassroomDoubleBooked(
//         sched1.classroom_id,
//         sched1.day_of_week,
//         sched1.start_time,
//         sched1.end_time,
//         sched1._id.toString()
//       );

//       return (
//         sched1TeachersOk &&
//         sched2TeachersOk &&
//         noClassroomDoubleBooking1 &&
//         noClassroomDoubleBooking2
//       );
//     };

//     for (let i = 0; i < allSchedules.length; i++) {
//       const randomIdx = Math.floor(Math.random() * allSchedules.length);
//       if (randomIdx === i) continue;

//       const schedule1 = allSchedules[i];
//       const schedule2 = allSchedules[randomIdx];

//       if (canSwap(schedule1, schedule2)) {
//         const temp = {
//           classroom_id: schedule1.classroom_id,
//           day_of_week: schedule1.day_of_week,
//           start_time: schedule1.start_time,
//           end_time: schedule1.end_time,
//         };

//         await Schedule.updateOne(
//           { _id: schedule1._id },
//           {
//             classroom_id: schedule2.classroom_id,
//             day_of_week: schedule2.day_of_week,
//             start_time: schedule2.start_time,
//             end_time: schedule2.end_time,
//           }
//         );
//         await Schedule.updateOne({ _id: schedule2._id }, temp);
//         console.log(`[BACKEND] ✓ VALID SWAP executed`);
//       } else {
//         console.log(`[BACKEND] ✗ INVALID SWAP prevented`);
//       }
//     }

//     console.log("[BACKEND] Finished shuffling");
//     res.json({ success: true });
//   } catch (err) {
//     console.error("[BACKEND] Error in shuffleSchedules:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };
// the one with only broken teaching times for no av teachers
exports.shuffleSchedules = async (_req, res) => {
  console.log("[BACKEND] /schedules/shuffle endpoint hit.");
  try {
    const Teacher = require("../models/teacher.js");
    const allSchedules = await Schedule.find({});
    if (allSchedules.length < 2) {
      return res.json({
        success: true,
        message: "Need at least 2 schedules to shuffle",
      });
    }
    const allTeachers = await Teacher.find({});
    const teacherMap = {};
    allTeachers.forEach((t) => {
      teacherMap[t.teacher_id] = t;
    });

    const teacherAvailableOnDay = (teacherId, day) => {
      const teacher = teacherMap[teacherId];
      if (!teacher || !teacher.availability) return false;
      const dayAvailability = teacher.availability[day.toLowerCase()];
      return Array.isArray(dayAvailability) && dayAvailability.length > 0;
    };

    // Check if teacher is double booked (at same time in any classroom)
    const isTeacherDoubleBooked = (
      teacherId,
      day,
      start,
      end,
      ignoreScheduleId
    ) => {
      return allSchedules.some(
        (s) =>
          s._id.toString() !== ignoreScheduleId &&
          s.teacher_ids.includes(teacherId) &&
          s.day_of_week === day &&
          s.start_time === start &&
          s.end_time === end
      );
    };

    // Check if classroom is double booked (more than 1 teacher at same time)
    const isClassroomDoubleBooked = (
      classroomId,
      day,
      start,
      end,
      ignoreScheduleId
    ) => {
      return allSchedules.some(
        (s) =>
          s._id.toString() !== ignoreScheduleId &&
          s.classroom_id === classroomId &&
          s.day_of_week === day &&
          s.start_time === start &&
          s.end_time === end
      );
    };

    const canSwap = (sched1, sched2) => {
      const sched1TeachersOk = sched1.teacher_ids.every(
        (tid) =>
          teacherAvailableOnDay(tid, sched2.day_of_week) &&
          !isTeacherDoubleBooked(
            tid,
            sched2.day_of_week,
            sched2.start_time,
            sched2.end_time,
            sched2._id.toString()
          )
      );
      const sched2TeachersOk = sched2.teacher_ids.every(
        (tid) =>
          teacherAvailableOnDay(tid, sched1.day_of_week) &&
          !isTeacherDoubleBooked(
            tid,
            sched1.day_of_week,
            sched1.start_time,
            sched1.end_time,
            sched1._id.toString()
          )
      );

      const noClassroomDoubleBooking1 = !isClassroomDoubleBooked(
        sched2.classroom_id,
        sched2.day_of_week,
        sched2.start_time,
        sched2.end_time,
        sched2._id.toString()
      );

      const noClassroomDoubleBooking2 = !isClassroomDoubleBooked(
        sched1.classroom_id,
        sched1.day_of_week,
        sched1.start_time,
        sched1.end_time,
        sched1._id.toString()
      );

      return (
        sched1TeachersOk &&
        sched2TeachersOk &&
        noClassroomDoubleBooking1 &&
        noClassroomDoubleBooking2
      );
    };

    for (let i = 0; i < allSchedules.length; i++) {
      const randomIdx = Math.floor(Math.random() * allSchedules.length);
      if (randomIdx === i) continue;

      const schedule1 = allSchedules[i];
      const schedule2 = allSchedules[randomIdx];

      if (canSwap(schedule1, schedule2)) {
        // Swap in DB
        await Schedule.updateOne(
          { _id: schedule1._id },
          {
            classroom_id: schedule2.classroom_id,
            day_of_week: schedule2.day_of_week,
            start_time: schedule2.start_time,
            end_time: schedule2.end_time,
          }
        );
        await Schedule.updateOne(
          { _id: schedule2._id },
          {
            classroom_id: schedule1.classroom_id,
            day_of_week: schedule1.day_of_week,
            start_time: schedule1.start_time,
            end_time: schedule1.end_time,
          }
        );

        // UPDATE IN-MEMORY ARRAY (THIS WAS MISSING!)
        const temp = {
          classroom_id: schedule1.classroom_id,
          day_of_week: schedule1.day_of_week,
          start_time: schedule1.start_time,
          end_time: schedule1.end_time,
        };
        schedule1.classroom_id = schedule2.classroom_id;
        schedule1.day_of_week = schedule2.day_of_week;
        schedule1.start_time = schedule2.start_time;
        schedule1.end_time = schedule2.end_time;

        schedule2.classroom_id = temp.classroom_id;
        schedule2.day_of_week = temp.day_of_week;
        schedule2.start_time = temp.start_time;
        schedule2.end_time = temp.end_time;

        console.log(`[BACKEND] ✓ VALID SWAP executed`);
      } else {
        console.log(`[BACKEND] ✗ INVALID SWAP prevented`);
      }
    }

    console.log("[BACKEND] Finished shuffling");
    res.json({ success: true });
  } catch (err) {
    console.error("[BACKEND] Error in shuffleSchedules:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

//
