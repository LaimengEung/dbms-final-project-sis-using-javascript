import { useState, useMemo } from "react";
import GradeStatCard from "./components/GradeStatCard";
import GradeTable from "./components/GradeTable";
import SemesterDropdown from "../myCourses/components/SemesterDropdown";
import FacultyLayout from "../../../components/layout/FacultyLayout";
import { Award, Check, CircleAlert, TrendingUp } from "lucide-react";

/* ── Default data ─────────────────────────────────────── */
const defaultCourses = [
  { id: 1, code: "CS 301", name: "Data Structures",    section: "Section 01", semester: "Spring 2025" },
  { id: 2, code: "CS 450", name: "Advanced Algorithms", section: "Section 02", semester: "Spring 2025" },
  { id: 3, code: "CS 490", name: "Senior Capstone",     section: "Section 01", semester: "Spring 2025" },
];

const defaultStudents = {
  1: [
    { id: 1, name: "James Wilson", studentId: "STU2024005", avatarUrl: null, grades: { midterm: 88, final: 84, assignments: 91, participation: 85 } },
    { id: 2, name: "Lisa Park",    studentId: "STU2024006", avatarUrl: null, grades: { midterm: 76, final: 79, assignments: 82, participation: 80 } },
    { id: 3, name: "David Kumar",  studentId: "STU2024007", avatarUrl: null, grades: { midterm: 95, final: 92, assignments: 97, participation: 90 } },
    { id: 4, name: "Sara Chen",    studentId: "STU2024008", avatarUrl: null, grades: { midterm: 65, final: 68, assignments: 70, participation: 72 } },
    { id: 5, name: "Mark Torres",  studentId: "STU2024009", avatarUrl: null, grades: { midterm: 82, final: 85, assignments: 78, participation: 88 } },
  ],
  2: [
    { id: 6, name: "Amy Nguyen",   studentId: "STU2024010", avatarUrl: null, grades: { midterm: 91, final: 88, assignments: 93, participation: 87 } },
    { id: 7, name: "Ben Carter",   studentId: "STU2024011", avatarUrl: null, grades: { midterm: 72, final: 75, assignments: 68, participation: 74 } },
  ],
  3: [
    { id: 8, name: "Clara Reid",   studentId: "STU2024012", avatarUrl: null, grades: { midterm: 89, final: 91, assignments: 94, participation: 92 } },
    { id: 9, name: "Oscar Lin",    studentId: "STU2024013", avatarUrl: null, grades: { midterm: 60, final: 63, assignments: 66, participation: 65 } },
  ],
};

/* ── Helpers ──────────────────────────────────────────── */
const calcAverage = (g) =>
  Math.round(g.midterm * 0.3 + g.final * 0.4 + g.assignments * 0.2 + g.participation * 0.1);

const computeStats = (students) => {
  if (!students.length) return { avg: "—", high: "—", low: "—", submitted: "—" };
  const avgs = students.map((s) => calcAverage(s.grades));
  return {
    avg:       (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1) + "%",
    high:      Math.max(...avgs) + "%",
    low:       Math.min(...avgs) + "%",
    submitted: `${students.length}/${students.length}`,
  };
};

/* ── Icons ────────────────────────────────────────────── */
const IconTrending = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconAward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const GradeManagement = ({
  courses = defaultCourses,
  studentsByCourse = defaultStudents,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [search, setSearch] = useState("");
  const [studentsData, setStudentsData] = useState(studentsByCourse);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const filteredCourses = selectedSemester
    ? courses.filter((c) => c.semester === selectedSemester)
    : courses;
  const rawStudents = studentsData[selectedCourseId] ?? [];

  const filteredStudents = useMemo(() =>
    rawStudents.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
    ), [rawStudents, search]);

  const stats = computeStats(rawStudents);

  const handleSave = (studentId, updatedGrades) => {
    setStudentsData((prev) => ({
      ...prev,
      [selectedCourseId]: prev[selectedCourseId].map((s) =>
        s.id === studentId ? { ...s, grades: updatedGrades } : s
      ),
    }));
  };

  const handleExport = () => alert(`Exporting grades for ${selectedCourse?.code}...`);

  return (
    <FacultyLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "#111827" }}>Grade Management</h1>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
              Manage and submit grades for your courses
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <SemesterDropdown
              value={selectedSemester}
              onChange={(sem) => {
                setSelectedSemester(sem);
                const firstCourse = courses.find((c) => c.semester === sem);
                setSelectedCourseId(firstCourse?.id ?? null);
              }}
            />
            <button
              onClick={handleExport}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", backgroundColor: "#fff",
                border: "1px solid #d1d5db", borderRadius: "8px",
                fontSize: "14px", fontWeight: 500, color: "#374151",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              <IconDownload /> Export
            </button>
            <button
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", backgroundColor: "#3b5bff",
                border: "none", borderRadius: "8px",
                fontSize: "14px", fontWeight: 600, color: "#fff",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a46e0")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b5bff")}
            >
              <IconCheck /> Submit Grades
            </button>
          </div>
        </div>

        {/* ── Course Selector Tabs ── */}
        <div
          style={{
            display: "flex", gap: "0",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          {filteredCourses.map((course, idx) => {
            const isActive = course.id === selectedCourseId;
            return (
              <button
                key={course.id}
                onClick={() => { setSelectedCourseId(course.id); setSearch(""); }}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  border: "none",
                  borderRight: idx < filteredCourses.length - 1 ? "1px solid #e5e7eb" : "none",
                  borderBottom: isActive ? "2px solid #3b5bff" : "2px solid transparent",
                  backgroundColor: isActive ? "#f0f4ff" : "#fff",
                  color: isActive ? "#3b5bff" : "#6b7280",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "background-color 0.15s, color 0.15s",
                }}
              >
                <div style={{ fontWeight: isActive ? 700 : 600, fontSize: "14px" }}>{course.code}</div>
                <div style={{ fontSize: "11.5px", marginTop: "2px", color: isActive ? "#6366f1" : "#9ca3af" }}>{course.name}</div>
              </button>
            );
          })}
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
          <GradeStatCard label="Class Average"  value={stats.avg}       icon={<TrendingUp />} color="#3b5bff" />
          <GradeStatCard label="Highest Grade"  value={stats.high}      icon={<Award />}    color="#16a34a" />
          <GradeStatCard label="Lowest Grade"   value={stats.low}       icon={<CircleAlert />}    color="#dc2626" />
          <GradeStatCard label="Submissions"    value={stats.submitted} icon={<Check />}    color="#d97706" />
        </div>

        {/* ── Search + Table Header ── */}
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
            {selectedCourse?.code} — {selectedCourse?.name}
            <span style={{ fontSize: "12.5px", fontWeight: 400, color: "#9ca3af", marginLeft: "8px" }}>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: "34px", paddingRight: "14px", paddingTop: "8px", paddingBottom: "8px",
                border: "1px solid #d1d5db", borderRadius: "8px",
                fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                color: "#374151", outline: "none", width: "220px",
                backgroundColor: "#f9fafb",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.backgroundColor = "#fff"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.backgroundColor = "#f9fafb"; }}
            />
          </div>
        </div>

        {/* ── Grade Table ── */}
        <GradeTable students={filteredStudents} onSave={handleSave} />

      </div>
    </FacultyLayout>
  );
};

export default GradeManagement;