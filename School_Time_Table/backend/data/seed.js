const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../config/database");


// Load environment variables from parent directory
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import models
const Teacher = require("../models/teacher.js");
const Course = require("../models/course.js");
const Classroom = require("../models/classroom.js");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// ALL 26 Teachers
const teachers = [
  {
    teacher_id: "T001",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@school.com",
    phone: "+1-234-567-8901",
    subjects: ["ARA_001", "REL_001"],
    assigned_classrooms: ["1A", "1B", "2A", "2B"],
    grade_levels: ["1", "2"],
    availability: {
      monday: ["08:00-10:00", "13:00-15:00"],
      tuesday: ["09:00-11:00"],
      wednesday: [],
      thursday: ["10:00-12:00"],
      friday: [],
    },
  },
  {
    teacher_id: "T002",
    name: "Sarah Johnson",
    email: "sarah.johnson@school.com",
    phone: "+1-234-567-8902",
    subjects: ["ENG_001", "PHIL_001"],
    assigned_classrooms: ["3A", "3B", "4A"],
    grade_levels: ["3", "4"],
    availability: {
      monday: ["09:00-12:00"],
      tuesday: ["08:00-11:00"],
      wednesday: ["09:00-12:00"],
      thursday: ["08:00-11:00"],
      friday: ["09:00-12:00"],
    },
  },
  {
    teacher_id: "T003",
    name: "Michael Chen",
    email: "michael.chen@school.com",
    phone: "+1-234-567-8903",
    subjects: ["MATH_001", "PHYS_001"],
    assigned_classrooms: ["10A", "10B", "11A", "11B"],
    grade_levels: ["10", "11"],
    joint_qualifications: ["MATH_001", "PHYS_001"],
    availability: {
      monday: ["08:00-11:00", "13:00-15:00"],
      tuesday: ["08:00-11:00"],
      wednesday: ["08:00-11:00"],
      thursday: ["08:00-11:00"],
      friday: ["08:00-11:00"],
    },
  },
  {
    teacher_id: "T004",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@school.com",
    phone: "+1-234-567-8904",
    subjects: ["SCI_001", "CHEM_001"],
    assigned_classrooms: ["7A", "7B", "8A", "8B"],
    grade_levels: ["7", "8"],
    availability: {
      monday: ["10:00-13:00"],
      tuesday: ["09:00-12:00"],
      wednesday: ["10:00-13:00"],
      thursday: ["09:00-12:00"],
      friday: ["10:00-13:00"],
    },
  },
  {
    teacher_id: "T005",
    name: "David Williams",
    email: "david.williams@school.com",
    phone: "+1-234-567-8905",
    subjects: ["PHYS_001", "MATH_001"],
    assigned_classrooms: ["12A", "12B"],
    joint_qualifications: ["MATH_001", "PHYS_001"],
    grade_levels: ["12"],
    availability: {
      monday: ["08:00-12:00"],
      tuesday: [],
      wednesday: ["08:00-12:00"],
      thursday: ["08:00-12:00"],
      friday: [],
    },
  },
  {
    teacher_id: "T006",
    name: "Fatima Al-Sayed",
    email: "fatima.alsayed@school.com",
    phone: "+1-234-567-8906",
    subjects: ["ARA_001", "HIST_001"],
    assigned_classrooms: ["5A", "5B", "6A"],
    grade_levels: ["5", "6"],
    availability: {
      monday: ["08:00-11:00"],
      tuesday: ["08:00-11:00"],
      wednesday: ["13:00-15:00"],
      thursday: ["08:00-11:00"],
      friday: ["08:00-11:00"],
    },
  },
  {
    teacher_id: "T007",
    name: "James Thompson",
    email: "james.thompson@school.com",
    phone: "+1-234-567-8907",
    subjects: ["ENG_001", "FRE_001"],
    assigned_classrooms: ["9A", "9B", "10A"],
    grade_levels: ["9", "10"],
    availability: {
      monday: ["13:00-16:00"],
      tuesday: ["13:00-16:00"],
      wednesday: ["13:00-16:00"],
      thursday: ["13:00-16:00"],
      friday: ["13:00-16:00"],
    },
  },
  {
    teacher_id: "T008",
    name: "Maria Garcia",
    email: "maria.garcia@school.com",
    phone: "+1-234-567-8908",
    subjects: ["MATH_001", "SCI_001"],
    assigned_classrooms: ["4A", "4B", "5A"],
    grade_levels: ["4", "5"],
    availability: {
      monday: [],
      tuesday: ["09:00-12:00"],
      wednesday: ["09:00-12:00"],
      thursday: [],
      friday: ["09:00-12:00"],
    },
  },
  {
    teacher_id: "T009",
    name: "Robert Lee",
    email: "robert.lee@school.com",
    phone: "+1-234-567-8909",
    subjects: ["PHYS_001", "CHEM_001"],
    assigned_classrooms: ["11A", "11B", "12A"],
    grade_levels: ["11", "12"],
    joint_qualifications: ["MATH_001", "PHYS_001"],
    availability: {
      monday: ["13:00-16:00"],
      tuesday: ["13:00-16:00"],
      wednesday: ["13:00-16:00"],
      thursday: ["13:00-16:00"],
      friday: ["13:00-16:00"],
    },
  },
  {
    teacher_id: "T010",
    name: "Aisha Mohammed",
    email: "aisha.mohammed@school.com",
    phone: "+1-234-567-8910",
    subjects: ["REL_001", "PHIL_001"],
    assigned_classrooms: ["3A", "3B", "4A", "4B"],
    grade_levels: ["3", "4"],
    availability: {
      monday: ["08:00-11:00"],
      tuesday: ["08:00-11:00"],
      wednesday: [],
      thursday: ["08:00-11:00"],
      friday: [],
    },
  },
  {
    teacher_id: "T011",
    name: "Jennifer Brown",
    email: "jennifer.brown@school.com",
    phone: "+1-234-567-8911",
    subjects: ["CHEM_001", "SCI_001"],
    assigned_classrooms: ["9A", "9B", "10A"],
    grade_levels: ["9", "10"],
    availability: {
      monday: ["09:00-13:00"],
      tuesday: ["09:00-13:00"],
      wednesday: ["09:00-13:00"],
      thursday: ["09:00-13:00"],
      friday: ["09:00-13:00"],
    },
  },
  {
    teacher_id: "T012",
    name: "Pierre Dubois",
    email: "pierre.dubois@school.com",
    phone: "+1-234-567-8912",
    subjects: ["FRE_001", "ENG_001"],
    assigned_classrooms: ["7A", "7B", "8A"],
    grade_levels: ["7", "8"],
    availability: {
      monday: ["08:00-12:00"],
      tuesday: ["08:00-12:00"],
      wednesday: ["08:00-12:00"],
      thursday: [],
      friday: ["08:00-12:00"],
    },
  },
  {
    teacher_id: "T013",
    name: "Linda Martinez",
    email: "linda.martinez@school.com",
    phone: "+1-234-567-8913",
    subjects: ["PHIL_001", "HIST_001"],
    assigned_classrooms: ["11A", "11B", "12A", "12B"],
    grade_levels: ["11", "12"],
    availability: {
      monday: ["10:00-14:00"],
      tuesday: ["10:00-14:00"],
      wednesday: ["10:00-14:00"],
      thursday: ["10:00-14:00"],
      friday: ["10:00-14:00"],
    },
  },
  {
    teacher_id: "T014",
    name: "Omar Ibrahim",
    email: "omar.ibrahim@school.com",
    phone: "+1-234-567-8914",
    subjects: ["ARA_001", "GEO_001"],
    assigned_classrooms: ["6A", "6B", "7A"],
    grade_levels: ["6", "7"],
    availability: {
      monday: ["13:00-16:00"],
      tuesday: ["13:00-16:00"],
      wednesday: ["13:00-16:00"],
      thursday: ["13:00-16:00"],
      friday: ["13:00-16:00"],
    },
  },
  {
    teacher_id: "T015",
    name: "Catherine White",
    email: "catherine.white@school.com",
    phone: "+1-234-567-8915",
    subjects: ["ENG_001", "HIST_001"],
    assigned_classrooms: ["5A", "5B", "6A", "6B"],
    grade_levels: ["5", "6"],
    availability: {
      monday: ["08:00-12:00"],
      tuesday: ["08:00-12:00"],
      wednesday: ["08:00-12:00"],
      thursday: ["08:00-12:00"],
      friday: ["08:00-12:00"],
    },
  },
  {
    teacher_id: "T016",
    name: "Kevin Park",
    email: "kevin.park@school.com",
    phone: "+1-234-567-8916",
    subjects: ["MATH_001", "GEO_001"],
    assigned_classrooms: ["8A", "8B", "9A"],
    grade_levels: ["8", "9"],
    availability: {
      monday: ["13:00-16:00"],
      tuesday: ["13:00-16:00"],
      wednesday: ["13:00-16:00"],
      thursday: ["13:00-16:00"],
      friday: ["13:00-16:00"],
    },
  },
  {
    teacher_id: "T017",
    name: "Sophie Laurent",
    email: "sophie.laurent@school.com",
    phone: "+1-234-567-8917",
    subjects: ["FRE_001", "ARA_001"],
    assigned_classrooms: ["10A", "10B", "11A"],
    grade_levels: ["10", "11"],
    availability: {
      monday: ["13:00-16:00"],
      tuesday: ["13:00-16:00"],
      wednesday: ["13:00-16:00"],
      thursday: ["13:00-16:00"],
      friday: ["13:00-16:00"],
    },
  },
  {
    teacher_id: "T018",
    name: "Mohammed Ali",
    email: "mohammed.ali@school.com",
    phone: "+1-234-567-8918",
    subjects: ["SCI_001", "PHYS_001"],
    assigned_classrooms: ["6A", "6B", "7A", "7B"],
    grade_levels: ["6", "7"],
    availability: {
      monday: ["08:00-12:00"],
      tuesday: ["08:00-12:00"],
      wednesday: ["08:00-12:00"],
      thursday: ["08:00-12:00"],
      friday: ["08:00-12:00"],
    },
  },
  {
    teacher_id: "T019",
    name: "Amanda Wilson",
    email: "amanda.wilson@school.com",
    phone: "+1-234-567-8919",
    subjects: ["CHEM_001", "MATH_001"],
    assigned_classrooms: ["9A", "9B", "10B"],
    grade_levels: ["9", "10"],
    availability: {
      monday: ["13:00-16:00"],
      tuesday: ["13:00-16:00"],
      wednesday: ["13:00-16:00"],
      thursday: ["13:00-16:00"],
      friday: ["13:00-16:00"],
    },
  },
  {
    teacher_id: "T020",
    name: "Hassan Karim",
    email: "hassan.karim@school.com",
    phone: "+1-234-567-8920",
    subjects: ["PHYS_001", "REL_001"],
    assigned_classrooms: ["8A", "8B", "9A", "9B"],
    grade_levels: ["8", "9"],
    availability: {
      monday: ["13:00-16:00"],
      tuesday: ["13:00-16:00"],
      wednesday: ["13:00-16:00"],
      thursday: ["13:00-16:00"],
      friday: ["13:00-16:00"],
    },
  },
  {
    teacher_id: "T021",
    name: "Rachel Green",
    email: "rachel.green@school.com",
    phone: "+1-234-567-8921",
    subjects: ["PHIL_001", "GEO_001"],
    assigned_classrooms: ["10A", "10B", "11B"],
    grade_levels: ["10", "11"],
    availability: {
      monday: ["08:00-11:00"],
      tuesday: ["08:00-11:00"],
      wednesday: ["08:00-11:00"],
      thursday: ["08:00-11:00"],
      friday: ["08:00-11:00"],
    },
  },
  {
    teacher_id: "T022",
    name: "Antonio Rossi",
    email: "antonio.rossi@school.com",
    phone: "+1-234-567-8922",
    subjects: ["SCI_001", "REL_001"],
    assigned_classrooms: ["1A", "1B", "2A"],
    grade_levels: ["1", "2"],
    availability: {
      monday: ["13:00-16:00"],
      tuesday: ["13:00-16:00"],
      wednesday: ["13:00-16:00"],
      thursday: ["13:00-16:00"],
      friday: ["13:00-16:00"],
    },
  },
  {
    teacher_id: "T023",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@school.com",
    phone: "+1-234-567-8923",
    subjects: ["MATH_001", "CHEM_001"],
    assigned_classrooms: ["7A", "7B", "8A"],
    grade_levels: ["7", "8"],
    availability: {
      monday: ["08:00-12:00"],
      tuesday: ["08:00-12:00"],
      wednesday: ["08:00-12:00"],
      thursday: ["08:00-12:00"],
      friday: ["08:00-12:00"],
    },
  },
  {
    teacher_id: "T024",
    name: "Isabella Santos",
    email: "isabella.santos@school.com",
    phone: "+1-234-567-8924",
    subjects: ["ENG_001", "FRE_001"],
    assigned_classrooms: ["11A", "11B", "12A"],
    grade_levels: ["11", "12"],
    availability: {
      monday: ["09:00-13:00"],
      tuesday: ["09:00-13:00"],
      wednesday: ["09:00-13:00"],
      thursday: ["09:00-13:00"],
      friday: ["09:00-13:00"],
    },
  },
  {
    teacher_id: "T025",
    name: "Dr. Marcus Thompson",
    email: "marcus.thompson@school.com",
    phone: "+1-234-567-8925",
    subjects: ["HIST_001", "GEO_001"],
    assigned_classrooms: ["9A", "9B", "10A", "10B"],
    grade_levels: ["9", "10"],
    availability: {
      monday: ["08:00-12:00"],
      tuesday: ["08:00-12:00"],
      wednesday: ["08:00-12:00"],
      thursday: ["08:00-12:00"],
      friday: ["08:00-12:00"],
    },
  },
  {
    teacher_id: "T026",
    name: "Dr. Elena Petrova",
    email: "elena.petrova@school.com",
    phone: "+1-234-567-8926",
    subjects: ["GEO_001", "HIST_001"],
    assigned_classrooms: ["11A", "11B", "12A", "12B"],
    grade_levels: ["11", "12"],
    availability: {
      monday: ["09:00-13:00"],
      tuesday: [],
      wednesday: ["09:00-13:00"],
      thursday: ["09:00-13:00"],
      friday: ["09:00-13:00"],
    },
  },
];

// ALL 11 Courses
const courses = [
  {
    course_id: "ARA_001",
    name: "Arabic",
    code: "ARA",
    description: "Arabic language and literature",
    credits: 3,
    department: "Languages",
  },
  {
    course_id: "ENG_001",
    name: "English",
    code: "ENG",
    description: "English language and literature",
    credits: 3,
    department: "Languages",
  },
  {
    course_id: "MATH_001",
    name: "Mathematics",
    code: "MATH",
    description: "Mathematics course",
    credits: 4,
    department: "Science",
    can_joint_teach: true,
  },
  {
    course_id: "SCI_001",
    name: "Science",
    code: "SCI",
    description: "General science course",
    credits: 3,
    department: "Science",
  },
  {
    course_id: "REL_001",
    name: "Religion",
    code: "REL",
    description: "Religious studies",
    credits: 2,
    department: "Humanities",
  },
  {
    course_id: "PHYS_001",
    name: "Physics",
    code: "PHYS",
    description: "Physics course",
    credits: 4,
    department: "Science",
    can_joint_teach: true,
  },
  {
    course_id: "CHEM_001",
    name: "Chemistry",
    code: "CHEM",
    description: "Chemistry course",
    credits: 4,
    department: "Science",
  },
  {
    course_id: "PHIL_001",
    name: "Philosophy",
    code: "PHIL",
    description: "Philosophy course",
    credits: 2,
    department: "Humanities",
  },
  {
    course_id: "FRE_001",
    name: "French",
    code: "FRE",
    description: "French language",
    credits: 3,
    department: "Languages",
  },
  {
    course_id: "HIST_001",
    name: "History",
    code: "HIST",
    description: "History course",
    credits: 3,
    department: "Humanities",
  },
  {
    course_id: "GEO_001",
    name: "Geography",
    code: "GEO",
    description: "Geography course",
    credits: 3,
    department: "Social Sciences",
  },
];

// Generate 24 classrooms
const classrooms = [];
for (let grade = 1; grade <= 12; grade++) {
  for (let section of ["A", "B"]) {
    classrooms.push({
      classroom_id: `${grade}${section}`,
      name: `${grade}${section}`,
      grade: String(grade),
      section: section,
      capacity: 30,
      building: "Main Building",
      floor: Math.floor((grade - 1) / 3) + 1,
      facilities: ["projector", "whiteboard", "AC"],
      students_count: 28,
    });
  }
}

// Seed function
async function seedDatabase() {
  try {
    await connectDB();

    console.log("🗑️  Clearing existing data...");
    await Teacher.deleteMany({});
    await Course.deleteMany({});
    await Classroom.deleteMany({});
    console.log("✅ Existing data cleared");

    console.log("📥 Inserting new data...");
    await Teacher.insertMany(teachers);
    await Course.insertMany(courses);
    await Classroom.insertMany(classrooms);

    console.log("✅ Database seeded successfully!");
    console.log(`📊 Inserted ${teachers.length} teachers`);
    console.log(`📚 Inserted ${courses.length} courses`);
    console.log(`🏫 Inserted ${classrooms.length} classrooms`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();

