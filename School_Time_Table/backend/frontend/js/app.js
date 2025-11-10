// // API Base URL
// const API_URL = "/api/v1";
// let teacherMap = {};
// let courseMap = {};
// let classroomMap = {};
// // Time slots for the timetable
// const TIME_SLOTS = [
//   "08:00-09:00",
//   "09:00-10:00",
//   "10:00-11:00",
//   "11:00-12:00",
//   "12:00-13:00",
//   "13:00-14:00",
//   "14:00-15:00",
//   "15:00-16:00",
// ];

// const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
// let coursesData = []; // For all course objects
// let teachersData = []; // For all teacher objects
// //
// function showLoader() {
//   document.getElementById("loader").style.display = "flex";
// }
// function hideLoader() {
//   document.getElementById("loader").style.display = "none";
// }

// // Create empty timetable grid
// function initializeTimetable() {
//   const tbody = document.getElementById("scheduleBody");
//   tbody.innerHTML = "";

//   TIME_SLOTS.forEach((timeSlot) => {
//     const row = document.createElement("tr");

//     // Time column
//     const timeCell = document.createElement("td");
//     timeCell.textContent = timeSlot;

//     timeCell.style.fontWeight = "bold";
//     row.appendChild(timeCell);

//     // });
//     DAYS.forEach((day) => {
//       // TIME_SLOTS.forEach((timeSlot) => {
//       const cell = document.createElement("td");
//       cell.className = "schedule-cell";
//       cell.dataset.day = day; // ← Make sure this is set
//       cell.dataset.time = timeSlot; // ← Make sure this is set

//       // ADD DROP HANDLERS:
//       cell.addEventListener("dragover", function (e) {
//         e.preventDefault();
//       });

//       cell.addEventListener("drop", async function (e) {
//         e.preventDefault();
//         const transfer = e.dataTransfer.getData("application/json");
//         if (!transfer) return;
//         const scheduleInfo = JSON.parse(transfer);
//         if (scheduleInfo.scheduleId) {
//           const response = await fetch(
//             `${API_URL}/schedules/${scheduleInfo.scheduleId}`,
//             {
//               method: "PATCH",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 classroom_id: cell.dataset.classroom,
//                 teacher_ids: scheduleInfo.teacherIds,
//                 day_of_week: cell.dataset.day,
//                 start_time: cell.dataset.time.split("-")[0],
//                 end_time: cell.dataset.time.split("-")[1],
//               }),
//             }
//           );

//           if (!response.ok) {
//             const result = await response.json();
//             alert(result.error || "Error updating schedule.");
//             loadSchedules();
//             return;
//           }
//           loadSchedules();
//           return;
//         }
//         console.log("Dropping on:", {
//           day: cell.dataset.day,
//           time: cell.dataset.time,
//           scheduleId: scheduleInfo.scheduleId,
//         });

//         // try {

//         // }
//       });

//       row.appendChild(cell);
//       // });
//     });

//     // TO BE CONTINUED(THE SWAPPING WORKED BUT DOUBLED THE FRONTEND GRID)
//     tbody.appendChild(row);
//   });
// }

// // Load teachers from API
// async function loadTeachers() {
//   try {
//     console.log("Loading teachers...");
//     const response = await fetch(`${API_URL}/teachers`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     //
//     teachersData = result.data;
//     console.log("Teachers loaded:", result.data.length);
//     teacherMap = {};
//     result.data.forEach((t) => {
//       teacherMap[t.teacher_id] = t.name;
//     });
//     const teacherSelects = [
//       document.getElementById("teacherFilter"),
//       document.getElementById("teacherId"),
//     ];

//     teacherSelects.forEach((select) => {
//       select.innerHTML = '<option value="">Select Teacher</option>';

//       result.data.forEach((teacher) => {
//         const option = document.createElement("option");
//         option.value = teacher.teacher_id;
//         option.textContent = teacher.name;
//         select.appendChild(option);
//       });
//     });

//     console.log("✅ Teachers dropdown populated");
//   } catch (error) {
//     console.error("❌ Error loading teachers:", error);
//     alert("Failed to load teachers. Check console for details.");
//   }
// }
// // Assuming you have a global coursesData array, populated on page load
// // Load courses from API
// async function loadCourses() {
//   try {
//     console.log("Loading courses...");
//     const response = await fetch(`${API_URL}/courses`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     //
//     coursesData = result.data;
//     console.log("Courses loaded:", result.data.length);
//     courseMap = {};
//     result.data.forEach((c) => {
//       courseMap[c.course_id] = c.name;
//     });
//     const courseSelect = document.getElementById("courseId");
//     courseSelect.innerHTML = '<option value="">Select Course</option>';

//     result.data.forEach((course) => {
//       const option = document.createElement("option");
//       option.value = course.course_id;
//       option.textContent = `${course.name} (${course.code})`;
//       courseSelect.appendChild(option);
//     });

//     console.log("✅ Courses dropdown populated");
//     setupJointTeachingListener();
//   } catch (error) {
//     console.error("❌ Error loading courses:", error);
//     alert("Failed to load courses. Check console for details.");
//   }
// }
// function setupJointTeachingListener() {
//   const courseSelect = document.getElementById("courseId");
//   courseSelect.removeEventListener("change", handleCourseChange); // Clean up
//   courseSelect.addEventListener("change", handleCourseChange);
// }

// function handleCourseChange() {
//   const selectedTeacherId = document.getElementById("teacherId").value;
//   const selectedCourseId = this.value;
//   const selectedCourse = coursesData.find(
//     (c) => c.course_id === selectedCourseId
//   );

//   if (selectedCourse && selectedCourse.can_joint_teach) {
//     document.getElementById("jointTeacherContainer").style.display = "block";
//     const jointTeacherDropdown = document.getElementById("jointTeacherId");
//     jointTeacherDropdown.innerHTML =
//       "<option value=''>Select Joint Teacher</option>";

//     teachersData.forEach((t) => {
//       if (
//         t.subjects.includes(selectedCourseId) &&
//         t.teacher_id !== selectedTeacherId
//       ) {
//         const opt = document.createElement("option");
//         opt.value = t.teacher_id;
//         opt.textContent = t.name;
//         jointTeacherDropdown.appendChild(opt);
//       }
//     });
//   } else {
//     document.getElementById("jointTeacherContainer").style.display = "none";
//   }
// }

// // Load classrooms from API
// async function loadClassrooms() {
//   try {
//     console.log("Loading classrooms...");
//     const response = await fetch(`${API_URL}/classrooms`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log("Classrooms loaded:", result.data.length);

//     const classroomSelects = [
//       document.getElementById("classroomFilter"),
//       document.getElementById("classroomId"),
//     ];

//     classroomSelects.forEach((select) => {
//       select.innerHTML = '<option value="">Select Classroom</option>';
//       classroomMap = {};
//       result.data.forEach((cl) => {
//         classroomMap[cl.classroom_id] = cl.name;
//       });
//       result.data.forEach((classroom) => {
//         const option = document.createElement("option");
//         option.value = classroom.classroom_id;
//         option.textContent = `Grade ${classroom.grade}${classroom.section}`;
//         select.appendChild(option);
//       });
//     });

//     console.log("✅ Classrooms dropdown populated");
//   } catch (error) {
//     console.error("❌ Error loading classrooms:", error);
//     alert("Failed to load classrooms. Check console for details.");
//   }
// }

// //
// // Helper function to get all time slots a schedule spans
// function getSpannedTimeSlots(startTime, endTime) {
//   const slots = [];
//   const allSlots = [
//     "08:00-09:00",
//     "09:00-10:00",
//     "10:00-11:00",
//     "11:00-12:00",
//     "12:00-13:00",
//     "13:00-14:00",
//     "14:00-15:00",
//     "15:00-16:00",
//   ];

//   for (let slot of allSlots) {
//     const [slotStart, slotEnd] = slot.split("-");
//     // Check if this slot overlaps with the schedule
//     if (startTime < slotEnd && endTime > slotStart) {
//       slots.push(slot);
//     }
//   }
//   return slots;
// }

// // Helper to get deterministic color (same color for same schedule)
// function getDeterministicColor(scheduleId) {
//   const palette = [
//     "hsl(0, 70%, 75%)", // Red
//     "hsl(72, 70%, 75%)",
//     "hsl(96, 70%, 75%)",
//     "hsl(24, 70%, 75%)",
//     "hsl(210, 70%, 75%)", // Blue
//     "hsl(120, 60%, 75%)", // Green
//     "hsl(40, 80%, 75%)", // Orange
//     "hsl(280, 60%, 75%)", // Purple
//     "hsl(180, 60%, 75%)", // Cyan
//     "hsl(60, 70%, 75%)", // Yellow
//     "hsl(300, 60%, 75%)", // Magenta
//     "hsl(160, 60%, 75%)", // Teal
//     "hsl(30, 80%, 80%)", // Coral
//     "hsl(288, 60%, 75%)",
//     "hsl(240, 60%, 75%)",
//     "hsl(48, 70%, 75%)",
//     "hsl(336, 60%, 75%)",
//   ];

//   let hash = 0;
//   for (let i = 0; i < scheduleId.length; i++) {
//     hash = scheduleId.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   return palette[Math.abs(hash) % palette.length];
// }
// // teachermap error
// async function loadSchedules() {
//   const classroomId = document.getElementById("classroomFilter").value;
//   const teacherId = document.getElementById("teacherFilter").value;

//   let url = `${API_URL}/schedules?`;
//   if (classroomId) url += `classroom_id=${classroomId}&`;
//   if (teacherId) url += `teacher_id=${teacherId}&`;

//   try {
//     console.log("Loading schedules from:", url);
//     const response = await fetch(url);
//     const result = await response.json();
//     //   result.data.forEach((schedule) => {
//     //   });
//     console.log("Schedules loaded:", result.data);

//     // Clear existing schedules
//     document.querySelectorAll(".schedule-cell").forEach((cell) => {
//       cell.innerHTML = "";
//     });

//     // Populate schedules
//     result.data.forEach((schedule) => {
//       console.log("Processing schedule:", schedule);

//       // Get all time slots this schedule spans
//       const timeSlots = getSpannedTimeSlots(
//         schedule.start_time,
//         schedule.end_time
//       );

//       // Get a consistent color for this schedule
//       const scheduleColor = getDeterministicColor(schedule.schedule_id);

//       console.log(`Schedule spans ${timeSlots.length} slots:`, timeSlots);

//       // Create a schedule item in each spanned slot
//       timeSlots.forEach((timeSlot) => {
//         const cell = document.querySelector(
//           `[data-day="${schedule.day_of_week}"][data-time="${timeSlot}"]`
//         );

//         if (cell) {
//           const item = document.createElement("div");
//           item.className = "schedule-item";
//           item.setAttribute("draggable", "true");

//           // Apply the same color to all cells of this schedule
//           item.style.background = scheduleColor;
//           let isDragging = false;
//           item.addEventListener("dragstart", function (e) {
//             e.dataTransfer.setData(
//               "application/json",
//               JSON.stringify({
//                 scheduleId: schedule.schedule_id,
//                 classroomId: schedule.classroom_id,
//                 teacherIds: schedule.teacher_ids,
//                 day: schedule.day_of_week,
//                 time: schedule.start_time + "-" + schedule.end_time,
//               })
//             );
//           });
//           item.addEventListener("dragend", function (e) {
//             isDragging = false;
//             // Optionally, tooltip logic can resume on mouseenter
//           });
//           // Extract the time range for THIS specific cell
//           const [cellStart, cellEnd] = timeSlot.split("-");

//           // Show full info in ALL cells, but with the specific time slot
//           item.innerHTML = `
//                         <strong>${schedule.course_id}</strong><br>
//                           ${schedule.grade}<br>
//                         ${
//                           Array.isArray(schedule.teacher_ids)
//                             ? schedule.teacher_ids
//                                 .map((id) => teacherMap[id])
//                                 .join(" & ")
//                             : schedule.teacher_id
//                         }<br>

//                         ${schedule.classroom_id}<br>
//                         <small>${cellStart}-${cellEnd}</small>
//                     `;

//           item.dataset.scheduleId = schedule.schedule_id;

//           // Tooltip handlers (show full schedule duration)
//           item.addEventListener("mouseenter", function (e) {
//             if (isDragging) return; // Prevent tooltip if dragging
//             const tooltip = document.getElementById("schedule-tooltip");
//             const teacherName = Array.isArray(schedule.teacher_ids)
//               ? schedule.teacher_ids
//                   .map((id) => teacherMap[id] || id)
//                   .join(" & ")
//               : teacherMap[schedule.teacher_id] || schedule.teacher_id;

//             const courseName =
//               courseMap[schedule.course_id] || schedule.course_id;
//             const className =
//               "Class " +
//               (classroomMap[schedule.classroom_id] || schedule.classroom_id);

//             tooltip.innerHTML = `
//                             <strong>${teacherName}</strong><br>
//                             ${courseName}<br>
//                             ${schedule.grade}<br>
//                             ${className}<br>
//                             <small>Full Duration: ${schedule.start_time} - ${schedule.end_time}</small>
//                         `;
//             tooltip.style.display = "block";

//             const rect = item.getBoundingClientRect();
//             tooltip.style.left = window.scrollX + rect.left + "px";
//             tooltip.style.top =
//               window.scrollY + rect.top - tooltip.offsetHeight - 10 + "px";
//           });

//           item.addEventListener("mousemove", function (e) {
//             if (isDragging) return; // Prevent tooltip if dragging
//             const tooltip = document.getElementById("schedule-tooltip");
//             tooltip.style.left = e.pageX + 12 + "px";
//             tooltip.style.top = e.pageY - 38 + "px";
//           });

//           item.addEventListener("mouseleave", function () {
            
//             document.getElementById("schedule-tooltip").style.display = "none";
//           });

//           item.addEventListener("click", () =>
//             deleteSchedule(schedule.schedule_id)
//           );

//           cell.appendChild(item);
//           console.log("✅ Added schedule to cell:", timeSlot);
//         } else {
//           console.warn(
//             "⚠️ Could not find cell for:",
//             schedule.day_of_week,
//             timeSlot
//           );
//         }
//       });
//     });

//     console.log("✅ All schedules displayed");
//   } catch (error) {
//     console.error("❌ Error loading schedules:", error);
//     alert("Failed to load schedules: " + error.message);
//   }
//   document.querySelectorAll(".schedule-cell").forEach((cell) => {
//     if (!cell.innerHTML.trim()) {
//       cell.classList.add("available-cell");
//     } else {
//       cell.classList.remove("available-cell");
//     }
//   });
// }



// async function loadSchedulesForWeek(selectedWeek) {
//   // Fetch all schedules as usual
//   let classroomId = document.getElementById("classroomFilter").value;
//   let teacherId = document.getElementById("teacherFilter").value;
//   let url = `${API_URL}/schedules?`;
//   if (classroomId) url += `classroom_id=${classroomId}&`;
//   if (teacherId) url += `teacher_id=${teacherId}&`;

//   try {
//     const response = await fetch(url);
//     const result = await response.json();

//     // Clear existing schedules in the table
//     document
//       .querySelectorAll(".schedule-cell")
//       .forEach((cell) => (cell.innerHTML = ""));

//     result.data.forEach((schedule) => {
//       // Find the teacher who owns this schedule
//       const teacherObj = teachersData.find(
//         (t) => t.teacher_id === schedule.teacher_ids[0]
//       );
//       // If the teacher has more than one subject, alternate which subject is taught this week
//       if (teacherObj && teacherObj.subjects && teacherObj.subjects.length > 1) {
//         schedule.course_id =
//           teacherObj.subjects[(selectedWeek - 1) % teacherObj.subjects.length];
//       }

//       // ---- Copy this block from your original rendering logic ----
//       const timeSlots = getSpannedTimeSlots(
//         schedule.start_time,
//         schedule.end_time
//       );
//       const scheduleColor = getDeterministicColor(schedule.schedule_id);

//       // timeSlots.forEach((timeSlot) => {
//       timeSlots.forEach((timeSlot) => {
//         const cell = document.querySelector(
//           `[data-day='${schedule.day_of_week}'][data-time='${timeSlot}']`
//         );
//         if (cell) {
//           const item = document.createElement("div");
//           item.className = "schedule-item";
//           item.setAttribute("draggable", "true");
//           item.style.background = scheduleColor;
//           item.innerHTML = `
//             <strong>${schedule.course_id}</strong><br>
//             ${schedule.grade}<br>
//             ${
//               Array.isArray(schedule.teacher_ids)
//                 ? schedule.teacher_ids.map((id) => teacherMap[id]).join(", ")
//                 : schedule.teacher_id
//             }
//             <br>${schedule.classroom_id}<br><small>${timeSlot}</small>
//           `;
//           item.dataset.scheduleId = schedule.schedule_id;
//           cell.appendChild(item);
//         }
//       });
//       // ---- End copy block ----
//     });
//     console.log("✅ All schedules displayed for week", selectedWeek);
//   } catch (error) {
//     console.error("❌ Error loading schedules for week:", error);
//     alert("Failed to load schedules for week: " + error.message);
//   }
// }

// // Delete schedule
// async function deleteSchedule(scheduleId) {
//   if (!confirm("Delete this schedule?")) return;

//   try {
//     const response = await fetch(`${API_URL}/schedules/${scheduleId}`, {
//       method: "DELETE",
//     });

//     if (response.ok) {
//       alert("Schedule deleted!");
//       loadSchedules();
//     } else {
//       alert("Failed to delete schedule");
//     }
//   } catch (error) {
//     console.error("Error deleting schedule:", error);
//     alert("Error deleting schedule");
//   }
// }

// // Save schedule
// async function saveSchedule(e) {
//   e.preventDefault();

//   const teacherId = document.getElementById("teacherId").value;
//   const courseId = document.getElementById("courseId").value;
//   const gradeLabel = document.getElementById("grade").value;
//   const classroomId = document.getElementById("classroomId").value;
//   const dayOfWeek = document.getElementById("dayOfWeek").value;
//   const startTime = document.getElementById("startTime").value;
//   const endTime = document.getElementById("endTime").value;

//   if (
//     !teacherId ||
//     !courseId ||
//     !classroomId ||
//     !dayOfWeek ||
//     !startTime ||
//     !endTime
//   ) {
//     alert("Please fill in all fields!");
//     return;
//   }
//   // >>> ADD THIS LINE <<<

//   let grade = null;
//   if (gradeLabel && typeof gradeLabel === "string") {
//     // Try to get numeric prefix, fallback to full label if not possible
//     const matched = gradeLabel.match(/^\\d+/);
//     grade = matched ? matched[0] : gradeLabel;
//   }

//   // <<< END LINE >>>
//   const scheduleData = {
//     schedule_id: `SCH_${Date.now()}`,
//     teacher_ids: [
//       teacherId,
//       document.getElementById("jointTeacherId")?.value || null,
//     ].filter(Boolean),
//     course_id: courseId,
//     grade: grade,
//     classroom_id: classroomId,
//     day_of_week: dayOfWeek,
//     start_time: startTime,
//     end_time: endTime,
//     status: "scheduled",
//     date: new Date().toISOString(),
//   };

//   console.log("Saving schedule:", scheduleData);

//   try {
//     const response = await fetch(`${API_URL}/schedules`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(scheduleData),
//     });

//     const result = await response.json();
//     console.log("Server response:", result);

//     if (response.ok && result.success) {
//       alert("✅ Schedule saved successfully!");
//       closeModal();
//       loadSchedules();
//     } else {
//       alert("❌ Failed to save schedule: " + (result.error || "Unknown error"));
//     }
//   } catch (error) {
//     console.error("Error saving schedule:", error);
//     alert("❌ Network error: " + error.message);
//   }
// }

// // Modal functions
// function openModal() {
//   document.getElementById("scheduleModal").style.display = "block";
// }

// function closeModal() {
//   document.getElementById("scheduleModal").style.display = "none";
//   document.getElementById("scheduleForm").reset();
// }

// // Close modal when clicking outside
// window.onclick = function (event) {
//   const modal = document.getElementById("scheduleModal");
//   if (event.target == modal) {
//     closeModal();
//   }
// };

// // Smart filtering - courses by teacher
// function setupTeacherCourseFilter() {
//   const teacherSelect = document.getElementById("teacherId");

//   if (!teacherSelect) return;

//   teacherSelect.addEventListener("change", async function () {
//     const selectedTeacherId = this.value;

//     if (!selectedTeacherId) {
//       loadCourses();
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/teachers/${selectedTeacherId}`);
//       const result = await response.json();

//       if (result.success && result.data) {
//         const teacher = result.data;
//         const teacherCourses = teacher.subjects;

//         const coursesResponse = await fetch(`${API_URL}/courses`);
//         const coursesResult = await coursesResponse.json();

//         const courseSelect = document.getElementById("courseId");
//         courseSelect.innerHTML = '<option value="">Select Course</option>';

//         coursesResult.data.forEach((course) => {
//           if (teacherCourses.includes(course.course_id)) {
//             const option = document.createElement("option");
//             option.value = course.course_id;
//             option.textContent = `${course.name} (${course.code})`;
//             courseSelect.appendChild(option);
//           }
//         });

//         console.log(`✅ Filtered courses for ${teacher.name}`);
//       }
//     } catch (error) {
//       console.error("Error filtering courses:", error);
//     }
//   });
// }

// // Smart filtering - classrooms by teacher
// function setupTeacherClassroomFilter() {
//   const teacherSelect = document.getElementById("teacherId");

//   if (!teacherSelect) return;

//   teacherSelect.addEventListener("change", async function () {
//     const selectedTeacherId = this.value;

//     if (!selectedTeacherId) {
//       loadClassrooms();
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/teachers/${selectedTeacherId}`);
//       const result = await response.json();

//       if (result.success && result.data) {
//         const teacher = result.data;
//         const teacherClassrooms = teacher.assigned_classrooms;

//         const classroomsResponse = await fetch(`${API_URL}/classrooms`);
//         const classroomsResult = await classroomsResponse.json();

//         const classroomSelect = document.getElementById("classroomId");
//         classroomSelect.innerHTML =
//           '<option value="">Select Classroom</option>';

//         classroomsResult.data.forEach((classroom) => {
//           if (teacherClassrooms.includes(classroom.classroom_id)) {
//             const option = document.createElement("option");
//             option.value = classroom.classroom_id;
//             option.textContent = `Grade ${classroom.grade}${classroom.section}`;
//             classroomSelect.appendChild(option);
//           }
//         });

//         console.log(`✅ Filtered classrooms for ${teacher.name}`);
//       }
//     } catch (error) {
//       console.error("Error filtering classrooms:", error);
//     }
//   });
// }

// // Initialize the app
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("App initialized");

//   initializeTimetable();
//   loadTeachers();
//   // Add THIS code right after loadTeachers() so the event will find teacherData and the select:
//   document.getElementById("teacherId").addEventListener("change", function () {
//     const selectedTeacherId = this.value;
//     const teacher = teachersData.find(
//       (t) => t.teacher_id === selectedTeacherId
//     ); // Or t.teacherid, match your schema
//     const gradeSelect = document.getElementById("grade");
//     gradeSelect.innerHTML = "<option value=''>Select Grade</option>";

//     if (teacher && teacher.grade_levels) {
//       const grades = Array.isArray(teacher.grade_levels)
//         ? teacher.grade_levels
//         : teacher.grade_levels.split(",");
//       grades.forEach((gradeRaw) => {
//         const grade = gradeRaw.trim();
//         const option = document.createElement("option");
//         option.value = grade; // Only "1", "2", etc.
//         option.textContent = grade; // Only "1", "2", etc.
//         gradeSelect.appendChild(option);
//       });
//     }
//   });
//   loadCourses();
//   loadClassrooms();

//   // Setup filters
//   setupTeacherCourseFilter();
//   setupTeacherClassroomFilter();

//   // Event listeners
//   document
//     .getElementById("loadSchedule")
//     .addEventListener("click", loadSchedules);
//   document.getElementById("addSchedule").addEventListener("click", openModal);
//   document.querySelector(".close").addEventListener("click", closeModal);
//   document
//     .getElementById("scheduleForm")
//     .addEventListener("submit", saveSchedule);
//   document
//     .getElementById("clearSchedules")
//     .addEventListener("click", async function () {
//       showLoader();
//       if (
//         !confirm(
//           "Are you sure you want to delete ALL schedules? This cannot be undone!"
//         )
//       )
//         return;

//       // Fetch all schedules first (could be paged if many)
//       let response = await fetch(`${API_URL}/schedules`);
//       let result = await response.json();
//       if (result.success) {
//         // Delete each schedule
//         for (const sched of result.data) {
//           await fetch(`${API_URL}/schedules/${sched.schedule_id}`, {
//             method: "DELETE",
//           });
//         }
//         hideLoader();
//         alert("✅ All schedules deleted!");
//         loadSchedules();
//       } else {
//         alert("❌ Could not load schedules. Try again.");
//       }
//     });
//   document
//     .getElementById("weekSelector")
//     .addEventListener("change", function () {
//       loadSchedulesForWeek(parseInt(this.value));
//     });
// });
// //
// document
//   .getElementById("shuffleTimetable")
//   .addEventListener("click", async function () {
//     console.log("[FRONTEND] Shuffle button pressed!");
//     try {
//       console.log("[FRONTEND] Sending POST request to backend...");
//       const response = await fetch(
//         "/api/v1/schedules/shuffle",
//         { method: "POST" }
//       );
//       console.log("[FRONTEND] Received response:", response);
//       const result = await response.json();
//       console.log("[FRONTEND] Response from backend:", result);
//       if (result.success) {
//         await loadSchedules();
//         console.log("[FRONTEND] Schedules reloaded after shuffle.");
//       } else {
//         alert(result.error || "Shuffle failed!");
//       }
//     } catch (error) {
//       alert("Network error or shuffle failed.");
//       console.error("[FRONTEND] Shuffle error:", error);
//     }
//   });

// //
// //  fix the broken populate button(400,409 errors)
// //   });
// function isTeacherAvailable(teacher, day, startTime, endTime) {
//   if (!teacher.availability || !teacher.availability[day]) {
//     // cell.style.background = "#e0e0e0";
//     return false;
//   }
//   const slots = Array.isArray(teacher.availability[day])
//     ? teacher.availability[day]
//     : teacher.availability[day].split(",").map((s) => s.trim());
//   for (const slot of slots) {
//     if (!slot || !slot.includes("-")) continue;
//     let [aStart, aEnd] = slot.split("-");
//     if (startTime >= aStart && endTime <= aEnd) return true;
//   }
//   return false;
// }

// document
//   .getElementById("populateSchedule")
//   .addEventListener("click", async function () {
//     showLoader();
//     if (
//       !confirm("This will add demo schedules to fill your timetable. Proceed?")
//     )
//       return;

//     if (coursesData.length === 0) await loadCourses();
//     if (teachersData.length === 0) await loadTeachers();
//     if (Object.keys(classroomMap).length === 0) await loadClassrooms();

//     let allRes = await fetch(`${API_URL}/schedules`);
//     let allResult = await allRes.json();
//     let allSchedules = allResult.data || [];
//     let slotMap = {};
//     let teacherSlotMap = {};
//     for (const sched of allSchedules) {
//       let skey = `${sched.day_of_week}|${sched.start_time}-${sched.end_time}|${sched.classroom_id}`;
//       slotMap[skey] = true;
//       for (const tid of sched.teacher_ids) {
//         let tkey = `${tid}|${sched.day_of_week}|${sched.start_time}-${sched.end_time}`;
//         teacherSlotMap[tkey] = true;
//       }
//     }

//     let successCount = 0,
//       failCount = 0;
//     for (const classroomId in classroomMap) {
//       for (const day of DAYS) {
//         for (const slot of TIME_SLOTS) {
//           const [startTime, endTime] = slot.split("-");

//           let skey = `${day}|${slot}|${classroomId}`;
//           if (slotMap[skey]) continue;

//           for (const course of coursesData) {
//             // Find only perfect teachers
//             const validTeachers = teachersData.filter((t) => {
//               // Teaches course
//               let teachesCourse = Array.isArray(t.subjects)
//                 ? t.subjects.includes(course.course_id)
//                 : typeof t.subjects === "string" &&
//                   t.subjects.split(",").includes(course.course_id);
//               if (!teachesCourse) return false;
//               // Grade-level match
//               if (!t.grade_levels) return false;
//               let grades = Array.isArray(t.grade_levels)
//                 ? t.grade_levels
//                 : t.grade_levels.split(",");
//               // let classroomObj = classroomMap
//               //     : null;
//               let classroomObj = classroomMap[classroomId];
//               let grade;
//               if (classroomObj && classroomObj.grade) {
//                 grade = String(classroomObj.grade).trim();
//               } else {
//                 // Extract numeric prefix from classroomId like "1A" => "1"
//                 grade = classroomId.match(/\d+/)[0];
//                 // ? classroomId.match(/\d+/)[0]
//                 // : null;
//               }

//               if (!grades.map((g) => String(g).trim()).includes(grade))
//                 return false;
//               // Available for exact slot
//               if (!t.availability || !t.availability[day]) return false;
//               if (!isTeacherAvailable(t, day, startTime, endTime)) return false;
//               return true;
//             });
//             // if (

//             // }
//             if (validTeachers.length === 0) {
//               teachersData.forEach((t) => {
//                 let reason = [];
//                 let teachesCourse = Array.isArray(t.subjects)
//                   ? t.subjects.includes(course.course_id)
//                   : typeof t.subjects === "string" &&
//                     t.subjects.split(",").includes(course.course_id);
//                 if (!teachesCourse)
//                   reason.push(
//                     "teacher does NOT teach this course (" +
//                       course.course_id +
//                       ")"
//                   );
//                 let grades = Array.isArray(t.grade_levels)
//                   ? t.grade_levels
//                   : t.grade_levels.split(",");

//                 // If classroomObj.grade is missing, extract grade from classroomId ("1A" => "1")
//                 let grd;
//                 let classroomObj = classroomMap[classroomId];
//                 if (classroomObj && classroomObj.grade) {
//                   grd = String(classroomObj.grade).trim();
//                 } else {
//                   // Extract numeric prefix from classroomId
//                   grd = classroomId.match(/\d+/)
//                     ? classroomId.match(/\d+/)[0]
//                     : null;
//                 }

//                 if (!grades.map((g) => String(g).trim()).includes(grd))
//                   reason.push(
//                     "teacher does NOT teach classroom's grade (" + grd + ")"
//                   );
//                 if (!t.availability || !t.availability[day])
//                   reason.push("teacher not available that day (" + day + ")");
//                 else if (
//                   !isTeacherAvailable(
//                     t,
//                     day,
//                     slot.split("-")[0],
//                     slot.split("-")[1]
//                   )
//                 )
//                   reason.push("teacher not available at slot (" + slot + ")");
//                 console.log("[DIAGNOSE]", {
//                   classroomId,
//                   day,
//                   slot,
//                   course: course.course_id,
//                   teacher: t.teacher_id,
//                   name: t.name,
//                   reason:
//                     reason.length === 0
//                       ? "WOULD BE SCHEDULED"
//                       : reason.join("; "),
//                 });
//               });
//             }

//             if (validTeachers.length === 0) continue;

//             const teacher = validTeachers[0];
//             const tkey = `${teacher.teacher_id}|${day}|${slot}`;
//             if (teacherSlotMap[tkey]) continue;

//             //     : "1";
//             let matched = classroomId.match(/^(\d+)/);
//             let grade = matched ? matched[1] : ""; // If nothing matched, grade is ""

//             const scheduleData = {
//               schedule_id: `SCH_${Date.now()}_${Math.random()
//                 .toString(36)
//                 .substr(2, 9)}`,
//               teacher_ids: [teacher.teacher_id],
//               course_id: course.course_id,
//               grade: grade,
//               classroom_id: classroomId,
//               day_of_week: day,
//               start_time: startTime,
//               end_time: endTime,
//               status: "scheduled",
//               date: new Date().toISOString(),
//             };

//             try {
//               const response = await fetch(`${API_URL}/schedules`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(scheduleData),
//               });
//               if (response.ok) {
//                 slotMap[skey] = true;
//                 teacherSlotMap[tkey] = true;
//                 successCount++;
//                 break;
//               }
//             } catch (err) {
//               failCount++;
//               break;
//             }
//           }
//         }
//       }
//     }
//     alert(
//       `Timetable population complete! Created: ${successCount}, Skipped/Errors: ${failCount}`
//     );
//     loadSchedules();
//     document
//       .getElementById("weekSelector")
//       .addEventListener("change", function () {
//         loadSchedulesForWeek(parseInt(this.value));
//       });
//     hideLoader();
//   });


// API Base URL
const API_URL = "http://localhost:3000/api/v1";
let teacherMap = {};
let courseMap = {};
let classroomMap = {};
// Time slots for the timetable
const TIME_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
let coursesData = []; // For all course objects
let teachersData = []; // For all teacher objects
//
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

// Create empty timetable grid
function initializeTimetable() {
  const tbody = document.getElementById("scheduleBody");
  tbody.innerHTML = "";

  TIME_SLOTS.forEach((timeSlot) => {
    const row = document.createElement("tr");

    // Time column
    const timeCell = document.createElement("td");
    timeCell.textContent = timeSlot;

    timeCell.style.fontWeight = "bold";
    row.appendChild(timeCell);

    // });
    DAYS.forEach((day) => {
      // TIME_SLOTS.forEach((timeSlot) => {
      const cell = document.createElement("td");
      cell.className = "schedule-cell";
      cell.dataset.day = day; // ← Make sure this is set
      cell.dataset.time = timeSlot; // ← Make sure this is set

      // ADD DROP HANDLERS:
      cell.addEventListener("dragover", function (e) {
        e.preventDefault();
      });

      cell.addEventListener("drop", async function (e) {
        e.preventDefault();
        const transfer = e.dataTransfer.getData("application/json");
        if (!transfer) return;
        const scheduleInfo = JSON.parse(transfer);
        if (scheduleInfo.scheduleId) {
          const response = await fetch(
            `${API_URL}/schedules/${scheduleInfo.scheduleId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                classroom_id: cell.dataset.classroom,
                teacher_ids: scheduleInfo.teacherIds,
                day_of_week: cell.dataset.day,
                start_time: cell.dataset.time.split("-")[0],
                end_time: cell.dataset.time.split("-")[1],
              }),
            }
          );

          if (!response.ok) {
            const result = await response.json();
            alert(result.error || "Error updating schedule.");
            loadSchedules();
            return;
          }
          loadSchedules();
          return;
        }
        console.log("Dropping on:", {
          day: cell.dataset.day,
          time: cell.dataset.time,
          scheduleId: scheduleInfo.scheduleId,
        });

        // try {

        // }
      });

      row.appendChild(cell);
      // });
    });

    // TO BE CONTINUED(THE SWAPPING WORKED BUT DOUBLED THE FRONTEND GRID)
    tbody.appendChild(row);
  });
}

// Load teachers from API
async function loadTeachers() {
  try {
    console.log("Loading teachers...");
    const response = await fetch(`${API_URL}/teachers`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    //
    teachersData = result.data;
    console.log("Teachers loaded:", result.data.length);
    teacherMap = {};
    result.data.forEach((t) => {
      teacherMap[t.teacher_id] = t.name;
    });
    const teacherSelects = [
      document.getElementById("teacherFilter"),
      document.getElementById("teacherId"),
    ];

    teacherSelects.forEach((select) => {
      select.innerHTML = '<option value="">Select Teacher</option>';

      result.data.forEach((teacher) => {
        const option = document.createElement("option");
        option.value = teacher.teacher_id;
        option.textContent = teacher.name;
        select.appendChild(option);
      });
    });

    console.log("✅ Teachers dropdown populated");
  } catch (error) {
    console.error("❌ Error loading teachers:", error);
    alert("Failed to load teachers. Check console for details.");
  }
}
// Assuming you have a global coursesData array, populated on page load
// Load courses from API
async function loadCourses() {
  try {
    console.log("Loading courses...");
    const response = await fetch(`${API_URL}/courses`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    //
    coursesData = result.data;
    console.log("Courses loaded:", result.data.length);
    courseMap = {};
    result.data.forEach((c) => {
      courseMap[c.course_id] = c.name;
    });
    const courseSelect = document.getElementById("courseId");
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    result.data.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.course_id;
      option.textContent = `${course.name} (${course.code})`;
      courseSelect.appendChild(option);
    });

    console.log("✅ Courses dropdown populated");
    setupJointTeachingListener();
  } catch (error) {
    console.error("❌ Error loading courses:", error);
    alert("Failed to load courses. Check console for details.");
  }
}
function setupJointTeachingListener() {
  const courseSelect = document.getElementById("courseId");
  courseSelect.removeEventListener("change", handleCourseChange); // Clean up
  courseSelect.addEventListener("change", handleCourseChange);
}

function handleCourseChange() {
  const selectedTeacherId = document.getElementById("teacherId").value;
  const selectedCourseId = this.value;
  const selectedCourse = coursesData.find(
    (c) => c.course_id === selectedCourseId
  );

  if (selectedCourse && selectedCourse.can_joint_teach) {
    document.getElementById("jointTeacherContainer").style.display = "block";
    const jointTeacherDropdown = document.getElementById("jointTeacherId");
    jointTeacherDropdown.innerHTML =
      "<option value=''>Select Joint Teacher</option>";

    teachersData.forEach((t) => {
      if (
        t.subjects.includes(selectedCourseId) &&
        t.teacher_id !== selectedTeacherId
      ) {
        const opt = document.createElement("option");
        opt.value = t.teacher_id;
        opt.textContent = t.name;
        jointTeacherDropdown.appendChild(opt);
      }
    });
  } else {
    document.getElementById("jointTeacherContainer").style.display = "none";
  }
}

// Load classrooms from API
async function loadClassrooms() {
  try {
    console.log("Loading classrooms...");
    const response = await fetch(`${API_URL}/classrooms`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Classrooms loaded:", result.data.length);

    const classroomSelects = [
      document.getElementById("classroomFilter"),
      document.getElementById("classroomId"),
    ];

    classroomSelects.forEach((select) => {
      select.innerHTML = '<option value="">Select Classroom</option>';
      classroomMap = {};
      result.data.forEach((cl) => {
        classroomMap[cl.classroom_id] = cl.name;
      });
      result.data.forEach((classroom) => {
        const option = document.createElement("option");
        option.value = classroom.classroom_id;
        option.textContent = `Grade ${classroom.grade}${classroom.section}`;
        select.appendChild(option);
      });
    });

    console.log("✅ Classrooms dropdown populated");
  } catch (error) {
    console.error("❌ Error loading classrooms:", error);
    alert("Failed to load classrooms. Check console for details.");
  }
}

//
// Helper function to get all time slots a schedule spans
function getSpannedTimeSlots(startTime, endTime) {
  const slots = [];
  const allSlots = [
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
  ];

  for (let slot of allSlots) {
    const [slotStart, slotEnd] = slot.split("-");
    // Check if this slot overlaps with the schedule
    if (startTime < slotEnd && endTime > slotStart) {
      slots.push(slot);
    }
  }
  return slots;
}

// Helper to get deterministic color (same color for same schedule)
function getDeterministicColor(scheduleId) {
  const palette = [
    "hsl(0, 70%, 75%)", // Red
    "hsl(72, 70%, 75%)",
    "hsl(96, 70%, 75%)",
    "hsl(24, 70%, 75%)",
    "hsl(210, 70%, 75%)", // Blue
    "hsl(120, 60%, 75%)", // Green
    "hsl(40, 80%, 75%)", // Orange
    "hsl(280, 60%, 75%)", // Purple
    "hsl(180, 60%, 75%)", // Cyan
    "hsl(60, 70%, 75%)", // Yellow
    "hsl(300, 60%, 75%)", // Magenta
    "hsl(160, 60%, 75%)", // Teal
    "hsl(30, 80%, 80%)", // Coral
    "hsl(288, 60%, 75%)",
    "hsl(240, 60%, 75%)",
    "hsl(48, 70%, 75%)",
    "hsl(336, 60%, 75%)",
  ];

  let hash = 0;
  for (let i = 0; i < scheduleId.length; i++) {
    hash = scheduleId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}
// teachermap error
async function loadSchedules() {
  const classroomId = document.getElementById("classroomFilter").value;
  const teacherId = document.getElementById("teacherFilter").value;

  let url = `${API_URL}/schedules?`;
  if (classroomId) url += `classroom_id=${classroomId}&`;
  if (teacherId) url += `teacher_id=${teacherId}&`;

  try {
    console.log("Loading schedules from:", url);
    const response = await fetch(url);
    const result = await response.json();
    //   result.data.forEach((schedule) => {
    //   });
    console.log("Schedules loaded:", result.data);

    // Clear existing schedules
    document.querySelectorAll(".schedule-cell").forEach((cell) => {
      cell.innerHTML = "";
    });

    // Populate schedules
    result.data.forEach((schedule) => {
      console.log("Processing schedule:", schedule);

      // Get all time slots this schedule spans
      const timeSlots = getSpannedTimeSlots(
        schedule.start_time,
        schedule.end_time
      );

      // Get a consistent color for this schedule
      const scheduleColor = getDeterministicColor(schedule.schedule_id);

      console.log(`Schedule spans ${timeSlots.length} slots:`, timeSlots);

      // Create a schedule item in each spanned slot
      timeSlots.forEach((timeSlot) => {
        const cell = document.querySelector(
          `[data-day="${schedule.day_of_week}"][data-time="${timeSlot}"]`
        );

        if (cell) {
          const item = document.createElement("div");
          item.className = "schedule-item";
          item.setAttribute("draggable", "true");

          // Apply the same color to all cells of this schedule
          item.style.background = scheduleColor;
          //
          let isDragging = false;
          item.addEventListener("dragstart", function (e) {
            isDragging = true;
            document.getElementById("schedule-tooltip").style.display = "none"; // Always hide tooltip
            e.dataTransfer.setData(
              "application/json",
              JSON.stringify({
                scheduleId: schedule.schedule_id,
                classroomId: schedule.classroom_id,
                teacherIds: schedule.teacher_ids,
                day: schedule.day_of_week,
                time: schedule.start_time + "-" + schedule.end_time,
              })
            );
          });
          //
          item.addEventListener("dragend", function (e) {
            isDragging = false;
            // Optionally, tooltip logic can resume on mouseenter
          });
          // Extract the time range for THIS specific cell
          const [cellStart, cellEnd] = timeSlot.split("-");

          // Show full info in ALL cells, but with the specific time slot
          item.innerHTML = `
                        <strong>${schedule.course_id}</strong><br>
                          ${schedule.grade}<br>
                        ${
                          Array.isArray(schedule.teacher_ids)
                            ? schedule.teacher_ids
                                .map((id) => teacherMap[id])
                                .join(" & ")
                            : schedule.teacher_id
                        }<br>

                        ${schedule.classroom_id}<br>
                        <small>${cellStart}-${cellEnd}</small>
                    `;

          item.dataset.scheduleId = schedule.schedule_id;

          // Tooltip handlers (show full schedule duration)
          item.addEventListener("mouseenter", function (e) {
            if (isDragging) return; // Prevent tooltip if dragging
            const tooltip = document.getElementById("schedule-tooltip");
            const teacherName = Array.isArray(schedule.teacher_ids)
              ? schedule.teacher_ids
                  .map((id) => teacherMap[id] || id)
                  .join(" & ")
              : teacherMap[schedule.teacher_id] || schedule.teacher_id;

            const courseName =
              courseMap[schedule.course_id] || schedule.course_id;
            const className =
              "Class " +
              (classroomMap[schedule.classroom_id] || schedule.classroom_id);

            tooltip.innerHTML = `
                            <strong>${teacherName}</strong><br>
                            ${courseName}<br>
                            ${schedule.grade}<br>
                            ${className}<br>
                            <small>Full Duration: ${schedule.start_time} - ${schedule.end_time}</small>
                        `;
            tooltip.style.display = "block";

            const rect = item.getBoundingClientRect();
            tooltip.style.left = window.scrollX + rect.left + "px";
            tooltip.style.top =
              window.scrollY + rect.top - tooltip.offsetHeight - 10 + "px";
          });

          item.addEventListener("mousemove", function (e) {
            if (isDragging) return; // Prevent tooltip if dragging
            const tooltip = document.getElementById("schedule-tooltip");
            tooltip.style.left = e.pageX + 12 + "px";
            tooltip.style.top = e.pageY - 38 + "px";
          });

          item.addEventListener("mouseleave", function () {
            document.getElementById("schedule-tooltip").style.display = "none";
          });

          item.addEventListener("click", () =>
            deleteSchedule(schedule.schedule_id)
          );
          //
          // ==== Mobile Drag & Drop Support (Touch Events) ====
          // Place after all desktop/tooltip handlers for each schedule-item

          // item.addEventListener("touchstart", function (e) {
          //   console.log("touchstart", item);
          //   window.mobileDragItem = item;
          //   window.mobileInitialTouch = e.touches[0];
          //   item.style.opacity = "0.6";
          // });

          // item.addEventListener("touchmove", function (e) {
          //   console.log("touchmove", item);
          //   if (!window.mobileDragItem) return;
          //   e.preventDefault();
          // });

          // item.addEventListener("touchend", async function (e) {
          //   console.log("touchend", item);
          //   if (!window.mobileDragItem) return;
          //   item.style.opacity = "";
          //   const touch = window.mobileInitialTouch;
          //   const dropCell = document.elementFromPoint(
          //     touch.clientX,
          //     touch.clientY
          //   );
          //   if (dropCell && dropCell.classList.contains("schedule-cell")) {
          //     // You may need to set these data attributes when creating `item` above:
          //     // item.dataset.scheduleId = schedule.scheduleid;
          //     // item.dataset.teacherIds = JSON.stringify(schedule.teacherids);

          //     const scheduleId = item.dataset.scheduleId;
          //     const classroomId = dropCell.dataset.classroom;
          //     const teacherIds = item.dataset.teacherIds;
          //     const dayOfWeek = dropCell.dataset.day;
          //     const time = dropCell.dataset.time;

          //     // Update the schedule via your backend (adjust API calls as needed!)
          //     await fetch(`${APIURL}/schedules/${scheduleId}`, {
          //       method: "PATCH",
          //       headers: { "Content-Type": "application/json" },
          //       body: JSON.stringify({
          //         classroomid: classroomId,
          //         teacherids: teacherIds,
          //         dayofweek: dayOfWeek,
          //         starttime: time.split("-")[0],
          //         endtime: time.split("-")[1],
          //       }),
          //     });
          //     await loadSchedules(); // Refresh the table
          //   }
          //   window.mobileDragItem = null;
          //   window.mobileInitialTouch = null;
          // });

          //

          cell.appendChild(item);
          console.log("✅ Added schedule to cell:", timeSlot);
        } else {
          console.warn(
            "⚠️ Could not find cell for:",
            schedule.day_of_week,
            timeSlot
          );
        }
      });
    });

    console.log("✅ All schedules displayed");
  } catch (error) {
    console.error("❌ Error loading schedules:", error);
    alert("Failed to load schedules: " + error.message);
  }
  document.querySelectorAll(".schedule-cell").forEach((cell) => {
    if (!cell.innerHTML.trim()) {
      cell.classList.add("available-cell");
    } else {
      cell.classList.remove("available-cell");
    }
  });
}
//

//
async function loadSchedulesForWeek(selectedWeek) {
  // Fetch all schedules as usual
  let classroomId = document.getElementById("classroomFilter").value;
  let teacherId = document.getElementById("teacherFilter").value;
  let url = `${API_URL}/schedules?`;
  if (classroomId) url += `classroom_id=${classroomId}&`;
  if (teacherId) url += `teacher_id=${teacherId}&`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    // Clear existing schedules in the table
    document
      .querySelectorAll(".schedule-cell")
      .forEach((cell) => (cell.innerHTML = ""));

    result.data.forEach((schedule) => {
      // Find the teacher who owns this schedule
      const teacherObj = teachersData.find(
        (t) => t.teacher_id === schedule.teacher_ids[0]
      );
      // If the teacher has more than one subject, alternate which subject is taught this week
      if (teacherObj && teacherObj.subjects && teacherObj.subjects.length > 1) {
        schedule.course_id =
          teacherObj.subjects[(selectedWeek - 1) % teacherObj.subjects.length];
      }

      // ---- Copy this block from your original rendering logic ----
      const timeSlots = getSpannedTimeSlots(
        schedule.start_time,
        schedule.end_time
      );
      const scheduleColor = getDeterministicColor(schedule.schedule_id);

      // timeSlots.forEach((timeSlot) => {
      timeSlots.forEach((timeSlot) => {
        const cell = document.querySelector(
          `[data-day='${schedule.day_of_week}'][data-time='${timeSlot}']`
        );
        if (cell) {
          const item = document.createElement("div");
          item.className = "schedule-item";
          item.setAttribute("draggable", "true");
          item.style.background = scheduleColor;
          item.innerHTML = `
            <strong>${schedule.course_id}</strong><br>
            ${schedule.grade}<br>
            ${
              Array.isArray(schedule.teacher_ids)
                ? schedule.teacher_ids.map((id) => teacherMap[id]).join(", ")
                : schedule.teacher_id
            }
            <br>${schedule.classroom_id}<br><small>${timeSlot}</small>
          `;
          item.dataset.scheduleId = schedule.schedule_id;
          cell.appendChild(item);
        }
      });
      // ---- End copy block ----
    });
    console.log("✅ All schedules displayed for week", selectedWeek);
  } catch (error) {
    console.error("❌ Error loading schedules for week:", error);
    alert("Failed to load schedules for week: " + error.message);
  }
}

// Delete schedule
async function deleteSchedule(scheduleId) {
  if (!confirm("Delete this schedule?")) return;

  try {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Schedule deleted!");
      loadSchedules();
    } else {
      alert("Failed to delete schedule");
    }
  } catch (error) {
    console.error("Error deleting schedule:", error);
    alert("Error deleting schedule");
  }
}

// Save schedule
async function saveSchedule(e) {
  e.preventDefault();

  const teacherId = document.getElementById("teacherId").value;
  const courseId = document.getElementById("courseId").value;
  const gradeLabel = document.getElementById("grade").value;
  const classroomId = document.getElementById("classroomId").value;
  const dayOfWeek = document.getElementById("dayOfWeek").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  if (
    !teacherId ||
    !courseId ||
    !classroomId ||
    !dayOfWeek ||
    !startTime ||
    !endTime
  ) {
    alert("Please fill in all fields!");
    return;
  }
  // >>> ADD THIS LINE <<<

  let grade = null;
  if (gradeLabel && typeof gradeLabel === "string") {
    // Try to get numeric prefix, fallback to full label if not possible
    const matched = gradeLabel.match(/^\\d+/);
    grade = matched ? matched[0] : gradeLabel;
  }

  // <<< END LINE >>>
  const scheduleData = {
    schedule_id: `SCH_${Date.now()}`,
    teacher_ids: [
      teacherId,
      document.getElementById("jointTeacherId")?.value || null,
    ].filter(Boolean),
    course_id: courseId,
    grade: grade,
    classroom_id: classroomId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    status: "scheduled",
    date: new Date().toISOString(),
  };

  console.log("Saving schedule:", scheduleData);

  try {
    const response = await fetch(`${API_URL}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    const result = await response.json();
    console.log("Server response:", result);

    if (response.ok && result.success) {
      alert("✅ Schedule saved successfully!");
      closeModal();
      loadSchedules();
    } else {
      alert("❌ Failed to save schedule: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error saving schedule:", error);
    alert("❌ Network error: " + error.message);
  }
}

// Modal functions
function openModal() {
  document.getElementById("scheduleModal").style.display = "block";
}

function closeModal() {
  document.getElementById("scheduleModal").style.display = "none";
  document.getElementById("scheduleForm").reset();
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("scheduleModal");
  if (event.target == modal) {
    closeModal();
  }
};

// Smart filtering - courses by teacher
function setupTeacherCourseFilter() {
  const teacherSelect = document.getElementById("teacherId");

  if (!teacherSelect) return;

  teacherSelect.addEventListener("change", async function () {
    const selectedTeacherId = this.value;

    if (!selectedTeacherId) {
      loadCourses();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/teachers/${selectedTeacherId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const teacher = result.data;
        const teacherCourses = teacher.subjects;

        const coursesResponse = await fetch(`${API_URL}/courses`);
        const coursesResult = await coursesResponse.json();

        const courseSelect = document.getElementById("courseId");
        courseSelect.innerHTML = '<option value="">Select Course</option>';

        coursesResult.data.forEach((course) => {
          if (teacherCourses.includes(course.course_id)) {
            const option = document.createElement("option");
            option.value = course.course_id;
            option.textContent = `${course.name} (${course.code})`;
            courseSelect.appendChild(option);
          }
        });

        console.log(`✅ Filtered courses for ${teacher.name}`);
      }
    } catch (error) {
      console.error("Error filtering courses:", error);
    }
  });
}

// Smart filtering - classrooms by teacher
function setupTeacherClassroomFilter() {
  const teacherSelect = document.getElementById("teacherId");

  if (!teacherSelect) return;

  teacherSelect.addEventListener("change", async function () {
    const selectedTeacherId = this.value;

    if (!selectedTeacherId) {
      loadClassrooms();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/teachers/${selectedTeacherId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const teacher = result.data;
        const teacherClassrooms = teacher.assigned_classrooms;

        const classroomsResponse = await fetch(`${API_URL}/classrooms`);
        const classroomsResult = await classroomsResponse.json();

        const classroomSelect = document.getElementById("classroomId");
        classroomSelect.innerHTML =
          '<option value="">Select Classroom</option>';

        classroomsResult.data.forEach((classroom) => {
          if (teacherClassrooms.includes(classroom.classroom_id)) {
            const option = document.createElement("option");
            option.value = classroom.classroom_id;
            option.textContent = `Grade ${classroom.grade}${classroom.section}`;
            classroomSelect.appendChild(option);
          }
        });

        console.log(`✅ Filtered classrooms for ${teacher.name}`);
      }
    } catch (error) {
      console.error("Error filtering classrooms:", error);
    }
  });
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");

  initializeTimetable();
  loadTeachers();
  // Add THIS code right after loadTeachers() so the event will find teacherData and the select:
  document.getElementById("teacherId").addEventListener("change", function () {
    const selectedTeacherId = this.value;
    const teacher = teachersData.find(
      (t) => t.teacher_id === selectedTeacherId
    ); // Or t.teacherid, match your schema
    const gradeSelect = document.getElementById("grade");
    gradeSelect.innerHTML = "<option value=''>Select Grade</option>";

    if (teacher && teacher.grade_levels) {
      const grades = Array.isArray(teacher.grade_levels)
        ? teacher.grade_levels
        : teacher.grade_levels.split(",");
      grades.forEach((gradeRaw) => {
        const grade = gradeRaw.trim();
        const option = document.createElement("option");
        option.value = grade; // Only "1", "2", etc.
        option.textContent = grade; // Only "1", "2", etc.
        gradeSelect.appendChild(option);
      });
    }
  });
  loadCourses();
  loadClassrooms();

  // Setup filters
  setupTeacherCourseFilter();
  setupTeacherClassroomFilter();

  // Event listeners
  document
    .getElementById("loadSchedule")
    .addEventListener("click", loadSchedules);
  document.getElementById("addSchedule").addEventListener("click", openModal);
  document.querySelector(".close").addEventListener("click", closeModal);
  document
    .getElementById("scheduleForm")
    .addEventListener("submit", saveSchedule);
  document
    .getElementById("clearSchedules")
    .addEventListener("click", async function () {
      showLoader();
      if (
        !confirm(
          "Are you sure you want to delete ALL schedules? This cannot be undone!"
        )
      )
        return;

      // Fetch all schedules first (could be paged if many)
      let response = await fetch(`${API_URL}/schedules`);
      let result = await response.json();
      if (result.success) {
        // Delete each schedule
        for (const sched of result.data) {
          await fetch(`${API_URL}/schedules/${sched.schedule_id}`, {
            method: "DELETE",
          });
        }
        hideLoader();
        alert("✅ All schedules deleted!");
        loadSchedules();
      } else {
        alert("❌ Could not load schedules. Try again.");
      }
    });
  document
    .getElementById("weekSelector")
    .addEventListener("change", function () {
      loadSchedulesForWeek(parseInt(this.value));
    });
});
//
document
  .getElementById("shuffleTimetable")
  .addEventListener("click", async function () {
    console.log("[FRONTEND] Shuffle button pressed!");
    try {
      console.log("[FRONTEND] Sending POST request to backend...");
      const response = await fetch(
        "http://localhost:3000/api/v1/schedules/shuffle",
        { method: "POST" }
      );
      console.log("[FRONTEND] Received response:", response);
      const result = await response.json();
      console.log("[FRONTEND] Response from backend:", result);
      if (result.success) {
        await loadSchedules();
        console.log("[FRONTEND] Schedules reloaded after shuffle.");
      } else {
        alert(result.error || "Shuffle failed!");
      }
    } catch (error) {
      alert("Network error or shuffle failed.");
      console.error("[FRONTEND] Shuffle error:", error);
    }
  });

//
//  fix the broken populate button(400,409 errors)
//   });
function isTeacherAvailable(teacher, day, startTime, endTime) {
  if (!teacher.availability || !teacher.availability[day]) {
    // cell.style.background = "#e0e0e0";
    return false;
  }
  const slots = Array.isArray(teacher.availability[day])
    ? teacher.availability[day]
    : teacher.availability[day].split(",").map((s) => s.trim());
  for (const slot of slots) {
    if (!slot || !slot.includes("-")) continue;
    let [aStart, aEnd] = slot.split("-");
    if (startTime >= aStart && endTime <= aEnd) return true;
  }
  return false;
}

document
  .getElementById("populateSchedule")
  .addEventListener("click", async function () {
    showLoader();
    if (
      !confirm("This will add demo schedules to fill your timetable. Proceed?")
    )
      return;

    if (coursesData.length === 0) await loadCourses();
    if (teachersData.length === 0) await loadTeachers();
    if (Object.keys(classroomMap).length === 0) await loadClassrooms();

    let allRes = await fetch(`${API_URL}/schedules`);
    let allResult = await allRes.json();
    let allSchedules = allResult.data || [];
    let slotMap = {};
    let teacherSlotMap = {};
    for (const sched of allSchedules) {
      let skey = `${sched.day_of_week}|${sched.start_time}-${sched.end_time}|${sched.classroom_id}`;
      slotMap[skey] = true;
      for (const tid of sched.teacher_ids) {
        let tkey = `${tid}|${sched.day_of_week}|${sched.start_time}-${sched.end_time}`;
        teacherSlotMap[tkey] = true;
      }
    }

    let successCount = 0,
      failCount = 0;
    for (const classroomId in classroomMap) {
      for (const day of DAYS) {
        for (const slot of TIME_SLOTS) {
          const [startTime, endTime] = slot.split("-");

          let skey = `${day}|${slot}|${classroomId}`;
          if (slotMap[skey]) continue;

          for (const course of coursesData) {
            // Find only perfect teachers
            const validTeachers = teachersData.filter((t) => {
              // Teaches course
              let teachesCourse = Array.isArray(t.subjects)
                ? t.subjects.includes(course.course_id)
                : typeof t.subjects === "string" &&
                  t.subjects.split(",").includes(course.course_id);
              if (!teachesCourse) return false;
              // Grade-level match
              if (!t.grade_levels) return false;
              let grades = Array.isArray(t.grade_levels)
                ? t.grade_levels
                : t.grade_levels.split(",");
              // let classroomObj = classroomMap
              //     : null;
              let classroomObj = classroomMap[classroomId];
              let grade;
              if (classroomObj && classroomObj.grade) {
                grade = String(classroomObj.grade).trim();
              } else {
                // Extract numeric prefix from classroomId like "1A" => "1"
                grade = classroomId.match(/\d+/)[0];
                // ? classroomId.match(/\d+/)[0]
                // : null;
              }

              if (!grades.map((g) => String(g).trim()).includes(grade))
                return false;
              // Available for exact slot
              if (!t.availability || !t.availability[day]) return false;
              if (!isTeacherAvailable(t, day, startTime, endTime)) return false;
              return true;
            });
            // if (

            // }
            if (validTeachers.length === 0) {
              teachersData.forEach((t) => {
                let reason = [];
                let teachesCourse = Array.isArray(t.subjects)
                  ? t.subjects.includes(course.course_id)
                  : typeof t.subjects === "string" &&
                    t.subjects.split(",").includes(course.course_id);
                if (!teachesCourse)
                  reason.push(
                    "teacher does NOT teach this course (" +
                      course.course_id +
                      ")"
                  );
                let grades = Array.isArray(t.grade_levels)
                  ? t.grade_levels
                  : t.grade_levels.split(",");

                // If classroomObj.grade is missing, extract grade from classroomId ("1A" => "1")
                let grd;
                let classroomObj = classroomMap[classroomId];
                if (classroomObj && classroomObj.grade) {
                  grd = String(classroomObj.grade).trim();
                } else {
                  // Extract numeric prefix from classroomId
                  grd = classroomId.match(/\d+/)
                    ? classroomId.match(/\d+/)[0]
                    : null;
                }

                if (!grades.map((g) => String(g).trim()).includes(grd))
                  reason.push(
                    "teacher does NOT teach classroom's grade (" + grd + ")"
                  );
                if (!t.availability || !t.availability[day])
                  reason.push("teacher not available that day (" + day + ")");
                else if (
                  !isTeacherAvailable(
                    t,
                    day,
                    slot.split("-")[0],
                    slot.split("-")[1]
                  )
                )
                  reason.push("teacher not available at slot (" + slot + ")");
                console.log("[DIAGNOSE]", {
                  classroomId,
                  day,
                  slot,
                  course: course.course_id,
                  teacher: t.teacher_id,
                  name: t.name,
                  reason:
                    reason.length === 0
                      ? "WOULD BE SCHEDULED"
                      : reason.join("; "),
                });
              });
            }

            if (validTeachers.length === 0) continue;

            const teacher = validTeachers[0];
            const tkey = `${teacher.teacher_id}|${day}|${slot}`;
            if (teacherSlotMap[tkey]) continue;

            //     : "1";
            let matched = classroomId.match(/^(\d+)/);
            let grade = matched ? matched[1] : ""; // If nothing matched, grade is ""

            const scheduleData = {
              schedule_id: `SCH_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              teacher_ids: [teacher.teacher_id],
              course_id: course.course_id,
              grade: grade,
              classroom_id: classroomId,
              day_of_week: day,
              start_time: startTime,
              end_time: endTime,
              status: "scheduled",
              date: new Date().toISOString(),
            };

            try {
              const response = await fetch(`${API_URL}/schedules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scheduleData),
              });
              if (response.ok) {
                slotMap[skey] = true;
                teacherSlotMap[tkey] = true;
                successCount++;
                break;
              }
            } catch (err) {
              failCount++;
              break;
            }
          }
        }
      }
    }
    alert(
      `Timetable population complete! Created: ${successCount}, Skipped/Errors: ${failCount}`
    );
    loadSchedules();
    document
      .getElementById("weekSelector")
      .addEventListener("change", function () {
        loadSchedulesForWeek(parseInt(this.value));
      });
    hideLoader();
  });



