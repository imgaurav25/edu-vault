// ===============================
// EduVault – Student ERP Sample Data
// ===============================

// -------- Departments ----------
const departments = [
  {
    deptId: "CSE",
    name: "Computer Science & Engineering",
    hod: "Dr. Priya Sharma",
  },
  {
    deptId: "ECE",
    name: "Electronics & Communication Engineering",
    hod: "Dr. Manish Kumar",
  },
  {
    deptId: "ME",
    name: "Mechanical Engineering",
    hod: "Dr. Anil Singh",
  },
  {
    deptId: "CE",
    name: "Civil Engineering",
    hod: "Prof. Kavita Sinha",
  }
];

// -------- Teachers ----------
const teachers = [
  {
    teacherId: "T1001",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@eduvault.edu",
    phone: "9876654432",
    department: "CSE",
    subjects: ["DSA101", "CS102"]
  },
  {
    teacherId: "T1002",
    name: "Prof. Amit Verma",
    email: "amit.verma@eduvault.edu",
    phone: "8899776622",
    department: "ECE",
    subjects: ["EC201", "EC205"]
  },
  {
    teacherId: "T1003",
    name: "Dr. Kavita Sinha",
    email: "kavita.sinha@eduvault.edu",
    phone: "9988776655",
    department: "CE",
    subjects: ["CE101"]
  }
];

// -------- Courses ----------
const courses = [
  {
    courseId: "CS101",
    name: "Programming in C",
    credits: 4,
    department: "CSE",
  },
  {
    courseId: "DSA101",
    name: "Data Structures & Algorithms",
    credits: 4,
    department: "CSE",
  },
  {
    courseId: "CS102",
    name: "OOP in Java",
    credits: 3,
    department: "CSE",
  },
  {
    courseId: "EC201",
    name: "Digital Electronics",
    credits: 4,
    department: "ECE",
  },
  {
    courseId: "ME101",
    name: "Engineering Mechanics",
    credits: 4,
    department: "ME",
  }
];

// -------- Students ----------
const students = [
  {
    studentId: "STU2024001",
    roll: "23CSE001",
    name: "Raghavendra Yadav",
    email: "raghav@eduvault.edu",
    phone: "9898989898",
    semester: 3,
    department: "CSE",
    courses: ["CS101", "DSA101", "CS102"],
    fatherName: "Mr. Suresh Yadav",
    address: "Prayagraj, Uttar Pradesh"
  },
  {
    studentId: "STU2024002",
    roll: "23CSE002",
    name: "Pranjal gaur",
    email: "pragya@eduvault.edu",
    phone: "9876543211",
    semester: 3,
    department: "CSE",
    courses: ["CS101", "DSA101", "CS102"],
    fatherName: "Mr. Rajesh gaur",
    address: "Bangalore, Karnataka"
  },
  {
    studentId: "STU2024003",
    roll: "23ECE001",
    name: "Arnav Gupta",
    email: "arnav@eduvault.edu",
    phone: "9123456789",
    semester: 3,
    department: "ECE",
    courses: ["EC201"],
    fatherName: "Mr. Sunil Gupta",
    address: "Delhi"
  }
];

// -------- Attendance Records ----------
const attendance = [
  {
    courseId: "CS101",
    date: "2025-01-20",
    present: ["23CSE001", "23CSE002"],
    absent: []
  },
  {
    courseId: "DSA101",
    date: "2025-01-20",
    present: ["23CSE002"],
    absent: ["23CSE001"]
  },
  {
    courseId: "EC201",
    date: "2025-01-21",
    present: ["23ECE001"],
    absent: []
  }
];

// -------- Fee Records ----------
const fees = [
  {
    studentId: "STU2024001",
    totalFee: 60000,
    paid: 40000,
    pending: 20000,
    lastPaymentDate: "2025-01-15"
  },
  {
    studentId: "STU2024002",
    totalFee: 60000,
    paid: 60000,
    pending: 0,
    lastPaymentDate: "2025-01-10"
  },
  {
    studentId: "STU2024003",
    totalFee: 58000,
    paid: 30000,
    pending: 28000,
    lastPaymentDate: "2025-01-18"
  }
];

// -------- Exam Results ----------
const results = [
  {
    studentId: "STU2024001",
    semester: 2,
    marks: {
      CS101: 85,
      MATH101: 78,
      PHY101: 80
    },
    cgpa: 8.1
  },
  {
    studentId: "STU2024002",
    semester: 2,
    marks: {
      CS101: 92,
      MATH101: 81,
      PHY101: 88
    },
    cgpa: 8.7
  }
];

// -------- College Notices ----------
const notices = [
  {
    noticeId: "NTC01",
    title: "Semester 3 Mid-Term Exam Schedule",
    date: "2025-01-22",
    message: "Mid-term exams start from Feb 10. Download timetable from ERP portal."
  },
  {
    noticeId: "NTC02",
    title: "Fee Payment Reminder",
    date: "2025-01-18",
    message: "Pay your pending fees before Jan 30 to avoid fine."
  }
];

// -------- EXPORT EVERYTHING ----------
module.exports = {
  students,
  teachers,
  courses,
  departments,
  fees,
  attendance,
  results,
  notices,
};
