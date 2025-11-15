const API_URL = "https://schooltimetable-production.up.railway.app/api/v1";
let teacherMap = {};
let courseMap = {};
let classroomMap = {};

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
let coursesData = []; 
let teachersData = []; 

function showLoader() {
  document.getElementById("loader").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}


function initializeTimetable() {
  const tbody = document.getElementById("scheduleBody");
  tbody.innerHTML = "";

  TIME_SLOTS.forEach((timeSlot) => {
    const row = document.createElement("tr");

    const timeCell = document.createElement("td");
    timeCell.textContent = timeSlot;
    timeCell.style.fontWeight = "bold";
    row.appendChild(timeCell);

    DAYS.forEach((day) => {
      const cell = document.createElement("td");
      cell.className = "schedule-cell";
      cell.dataset.day = day;
      cell.dataset.time = timeSlot;
      
      cell.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        cell.style.backgroundColor = "#e3f2fd"; 
      });

      cell.addEventListener("dragleave", function (e) {
        if (e.target === cell) {
          cell.style.backgroundColor = "";
        }
      });

      cell.addEventListener("drop", async function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        cell.style.backgroundColor = ""; 
        
        console.log(" DROP EVENT FIRED on cell:", {
          day: cell.dataset.day,
          time: cell.dataset.time,
          classroom: cell.dataset.classroom,
        });

        let transfer = null;
        let scheduleInfo = null;

        try {
          transfer = e.dataTransfer.getData("application/json");
          if (transfer) {
            scheduleInfo = JSON.parse(transfer);
          }
        } catch (err) {
          console.warn("Failed to parse JSON transfer:", err);
        }

        if (!scheduleInfo) {
          try {
            transfer = e.dataTransfer.getData("text/plain");
            if (transfer) {
              scheduleInfo = JSON.parse(transfer);
            }
          } catch (err) {
            console.warn("Failed to parse text transfer:", err);
          }
        }

        if (!scheduleInfo) {
          console.error(" No transfer data found. Available types:", {
            types: e.dataTransfer.types,
            items: e.dataTransfer.items?.length || 0,
          });
          return;
        }

        console.log(" Transfer data received:", scheduleInfo);

        if (!scheduleInfo.scheduleId) {
          console.error(" No scheduleId in transfer data");
          return;
        }


        const payload = {
  classroom_id: scheduleInfo.classroomId,  
  teacher_ids: scheduleInfo.teacherIds || [],
  day_of_week: cell.dataset.day,
  start_time: cell.dataset.time.split("-")[0],
  end_time: cell.dataset.time.split("-")[1],
};


        console.log("Sending PATCH request with payload:", payload);

        try {
          const response = await fetch(
            `${API_URL}/schedules/${scheduleInfo.scheduleId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          console.log("Response status:", response.status);

          if (!response.ok) {
            const result = await response.json();
            console.error(" Backend error:", result);
            alert(result.error || `Error: ${response.status}`);
            return;
          }

          console.log(" Schedule updated successfully");
          await loadSchedules();
        } catch (error) {
          console.error(" Network error:", error);
          alert("Network error: " + error.message);
        }
      });

      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
}


async function loadTeachers() {
  try {
    console.log("Loading teachers...");
    const response = await fetch(`${API_URL}/teachers`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

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

    console.log(" Teachers dropdown populated");
  } catch (error) {
    console.error(" Error loading teachers:", error);
    alert("Failed to load teachers");
  }
}

async function loadCourses() {
  try {
    console.log("Loading courses...");
    const response = await fetch(`${API_URL}/courses`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
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

    console.log(" Courses dropdown populated");
    setupJointTeachingListener();
  } catch (error) {
    console.error(" Error loading courses:", error);
    alert("Failed to load courses");
  }
}
function setupJointTeachingListener() {
  const courseSelect = document.getElementById("courseId");
  courseSelect.removeEventListener("change", handleCourseChange);
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

    console.log(" Classrooms dropdown populated");
  } catch (error) {
    console.error(" Error loading classrooms:", error);
    alert("Failed to load classrooms");
  }
}

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
    if (startTime < slotEnd && endTime > slotStart) {
      slots.push(slot);
    }
  }
  return slots;
}

function getDeterministicColor(scheduleId) {
  const palette = [
    "hsl(0, 70%, 75%)", 
    "hsl(72, 70%, 75%)",
    "hsl(96, 70%, 75%)",
    "hsl(24, 70%, 75%)",
    "hsl(210, 70%, 75%)", 
    "hsl(120, 60%, 75%)", 
    "hsl(40, 80%, 75%)", 
    "hsl(280, 60%, 75%)", 
    "hsl(180, 60%, 75%)", 
    "hsl(60, 70%, 75%)", 
    "hsl(300, 60%, 75%)", 
    "hsl(160, 60%, 75%)", 
    "hsl(30, 80%, 80%)", 
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
    
    console.log("Schedules loaded:", result.data);

    
    document.querySelectorAll(".schedule-cell").forEach((cell) => {
      cell.innerHTML = "";
    });

    result.data.forEach((schedule) => {
      console.log("Processing schedule:", schedule);

      const timeSlots = getSpannedTimeSlots(
        schedule.start_time,
        schedule.end_time
      );

      const scheduleColor = getDeterministicColor(schedule.schedule_id);

      console.log(`Schedule spans ${timeSlots.length} slots:`, timeSlots);

      timeSlots.forEach((timeSlot) => {
        const cell = document.querySelector(
          `[data-day="${schedule.day_of_week}"][data-time="${timeSlot}"]`
        );

        if (cell) {
cell.dataset.classroom = schedule.classroom_id;
          const item = document.createElement("div");
          item.className = "schedule-item";
          item.setAttribute("draggable", "true");
          item.style.background = scheduleColor;

          let isDragging = false;
      
          item.addEventListener("dragstart", function (e) {
  isDragging = true;
  document.getElementById("schedule-tooltip").style.display = "none";
  
  const transferData = JSON.stringify({
    scheduleId: schedule.schedule_id,
    classroomId: schedule.classroom_id,
    teacherIds: schedule.teacher_ids || [],
    day: schedule.day_of_week,
    time: schedule.start_time + "-" + schedule.end_time,
  });

  console.log("Dragging schedule:", {
    scheduleId: schedule.schedule_id,
    classroom: schedule.classroom_id,
  });

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("application/json", transferData);
  e.dataTransfer.setData("text/plain", transferData); 

  const dragImage = new Image();
  dragImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Ccircle cx='25' cy='25' r='20' fill='%23667eea'/%3E%3C/svg%3E";
  e.dataTransfer.setDragImage(dragImage, 25, 25);
});

        
          item.addEventListener("dragend", function (e) {
            isDragging = false;
          });
        
          const [cellStart, cellEnd] = timeSlot.split("-");

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

          item.addEventListener("mouseenter", function (e) {
            if (isDragging) return; 
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
            if (isDragging) return; 
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

          cell.appendChild(item);
          console.log("Added schedule to cell:", timeSlot);
        } else {
          console.warn(
            "Could not find cell for:",
            schedule.day_of_week,
            timeSlot
          );
        }
      });
    });

    console.log(" All schedules displayed");
  } catch (error) {
    console.error(" Error loading schedules:", error);
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

async function loadSchedulesForWeek(selectedWeek) {
  let classroomId = document.getElementById("classroomFilter").value;
  let teacherId = document.getElementById("teacherFilter").value;
  let url = `${API_URL}/schedules?`;
  if (classroomId) url += `classroom_id=${classroomId}&`;
  if (teacherId) url += `teacher_id=${teacherId}&`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    document
      .querySelectorAll(".schedule-cell")
      .forEach((cell) => (cell.innerHTML = ""));

    result.data.forEach((schedule) => {
      
      const teacherObj = teachersData.find(
        (t) => t.teacher_id === schedule.teacher_ids[0]
      );
  
      if (teacherObj && teacherObj.subjects && teacherObj.subjects.length > 1) {
        schedule.course_id =
          teacherObj.subjects[(selectedWeek - 1) % teacherObj.subjects.length];
      }

      const timeSlots = getSpannedTimeSlots(
        schedule.start_time,
        schedule.end_time
      );
      const scheduleColor = getDeterministicColor(schedule.schedule_id);

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

    });
    console.log("All schedules displayed for week", selectedWeek);
  } catch (error) {
    console.error(" Error loading schedules for week:", error);
    alert("Failed to load schedules for week: " + error.message);
  }
}

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

  let grade = null;
  if (gradeLabel && typeof gradeLabel === "string") {
  
    const matched = gradeLabel.match(/^\\d+/);
    grade = matched ? matched[0] : gradeLabel;
  }

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
      alert(" Schedule saved successfully");
      closeModal();
      loadSchedules();
    } else {
      alert("Failed to save schedule: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error saving schedule:", error);
    alert("Network error: " + error.message);
  }
}

function openModal() {
  document.getElementById("scheduleModal").style.display = "block";
}

function closeModal() {
  document.getElementById("scheduleModal").style.display = "none";
  document.getElementById("scheduleForm").reset();
}

window.onclick = function (event) {
  const modal = document.getElementById("scheduleModal");
  if (event.target == modal) {
    closeModal();
  }
};

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

        console.log(`Filtered courses for ${teacher.name}`);
      }
    } catch (error) {
      console.error("Error filtering courses:", error);
    }
  });
}

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

        console.log(`Filtered classrooms for ${teacher.name}`);
      }
    } catch (error) {
      console.error("Error filtering classrooms:", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");

  initializeTimetable();
  loadTeachers();
  
  document.getElementById("teacherId").addEventListener("change", function () {
    const selectedTeacherId = this.value;
    const teacher = teachersData.find(
      (t) => t.teacher_id === selectedTeacherId
    ); 
    const gradeSelect = document.getElementById("grade");
    gradeSelect.innerHTML = "<option value=''>Select Grade</option>";

    if (teacher && teacher.grade_levels) {
      const grades = Array.isArray(teacher.grade_levels)
        ? teacher.grade_levels
        : teacher.grade_levels.split(",");
      grades.forEach((gradeRaw) => {
        const grade = gradeRaw.trim();
        const option = document.createElement("option");
        option.value = grade; 
        option.textContent = grade; 
        gradeSelect.appendChild(option);
      });
    }
  });
  loadCourses();
  loadClassrooms();

  setupTeacherCourseFilter();
  setupTeacherClassroomFilter();

  document.getElementById("classroomFilter").addEventListener("change", loadSchedules);

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
          "Are you sure you want to delete ALL schedules? This cannot be undone"
        )
      )
        return;

      let response = await fetch(`${API_URL}/schedules`);
      let result = await response.json();
      if (result.success) {
        for (const sched of result.data) {
          await fetch(`${API_URL}/schedules/${sched.schedule_id}`, {
            method: "DELETE",
          });
        }
        hideLoader();
        alert("All schedules deleted");
        loadSchedules();
      } else {
        alert("Could not load schedules. Try again.");
      }
    });
  document
    .getElementById("weekSelector")
    .addEventListener("change", function () {
      loadSchedulesForWeek(parseInt(this.value));
    });
});

document
  .getElementById("shuffleTimetable")
  .addEventListener("click", async function () {
    console.log("[FRONTEND] Shuffle button pressed!");
    try {
      console.log("[FRONTEND] Sending POST request to backend...");
      const response = await fetch(
        `${API_URL}/schedules/shuffle`,
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


function isTeacherAvailable(teacher, day, startTime, endTime) {
  if (!teacher.availability || !teacher.availability[day]) {
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
            const validTeachers = teachersData.filter((t) => {
              
              let teachesCourse = Array.isArray(t.subjects)
                ? t.subjects.includes(course.course_id)
                : typeof t.subjects === "string" &&
                  t.subjects.split(",").includes(course.course_id);
              if (!teachesCourse) return false;
        
              if (!t.grade_levels) return false;
              let grades = Array.isArray(t.grade_levels)
                ? t.grade_levels
                : t.grade_levels.split(",");
              let classroomObj = classroomMap[classroomId];
              let grade;
              if (classroomObj && classroomObj.grade) {
                grade = String(classroomObj.grade).trim();
              } else {
                grade = classroomId.match(/\d+/)[0];
              }

              if (!grades.map((g) => String(g).trim()).includes(grade))
                return false;
          
              if (!t.availability || !t.availability[day]) return false;
              if (!isTeacherAvailable(t, day, startTime, endTime)) return false;
              return true;
            });
            
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

                let grd;
                let classroomObj = classroomMap[classroomId];
                if (classroomObj && classroomObj.grade) {
                  grd = String(classroomObj.grade).trim();
                } else {
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
            
            let matched = classroomId.match(/^(\d+)/);
            let grade = matched ? matched[1] : ""; 

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
