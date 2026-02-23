import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClassInfoCard from "./ClassInfoCard";
import StudentSearchBar from "./StudentSearchBar";
import StudentListTable from "./StudentListTable";
import FacultyLayout from "../../../../components/layout/FacultyLayout";

const defaultCourse = {
  code: "CS 301",
  name: "Data Structures",
  section: "Section 01",
  schedule: "MWF 9:00–10:30 AM",
  room: "Engineering 201",
  enrolled: 28,
};

const defaultStudents = [
  { id: 1, studentId: "STU2024001", name: "Sarah Johnson",     email: "sarah.johnson@university.edu",   major: "Computer Science", grade: "A",  avatarUrl: null },
  { id: 2, studentId: "STU2024002", name: "Michael Rodriguez", email: "m.rodriguez@university.edu",     major: "Computer Science", grade: "B+", avatarUrl: null },
  { id: 3, studentId: "STU2024003", name: "Emily Chen",        email: "a.chen@university.edu",          major: "Computer Science", grade: "A-", avatarUrl: null },
  { id: 4, studentId: "STU2024004", name: "James Wilson",      email: "j.wilson@university.edu",        major: "Computer Science", grade: null, avatarUrl: null },
  { id: 5, studentId: "STU2024015", name: "Jessica Brown",     email: "j.brown@university.edu",         major: "Computer Science", grade: "B",  avatarUrl: null },
  { id: 6, studentId: "STU2024016", name: "Daniel Lee",        email: "d.lee@university.edu",           major: "Computer Science", grade: "A",  avatarUrl: null },
  { id: 7, studentId: "STU2024017", name: "Amanda White",      email: "a.white@university.edu",         major: "Computer Science", grade: "C+", avatarUrl: null },
  { id: 8, studentId: "STU2024018", name: "Christopher Davis", email: "c.davis@university.edu",         major: "Computer Science", grade: "B-", avatarUrl: null },
];

const ViewStudentsPanel = ({
  course = defaultCourse,
  students = defaultStudents,
  onBack,
}) => {
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() =>
    students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    ), [students, search]);

  const handleEmailAll  = () => alert(`Emailing all ${students.length} students in ${course.code}`);
  const handleExport    = () => alert(`Exporting student list for ${course.code}`);
  const handleViewProfile = (s) => alert(`Viewing profile: ${s.name}`);
  const handleEmail     = (s) => alert(`Emailing: ${s.email}`);

  return (
    <FacultyLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", fontSize: "13px", color: "#6b7280" }}>
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#3b5bff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            My Courses
          </button>
          <span style={{ color: "#d1d5db" }}>/</span>
          <span style={{ color: "#374151", fontWeight: 500 }}>{course.code} – {course.name}</span>
        </div>

        {/* Class Info Card */}
        <div style={{ marginBottom: "16px" }}>
          <ClassInfoCard course={course} />
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "16px" }}>
          <StudentSearchBar
            value={search}
            onChange={setSearch}
            onEmailAll={handleEmailAll}
            onExport={handleExport}
          />
        </div>

        {/* Student List Table */}
        <StudentListTable
          students={filteredStudents}
          onViewProfile={handleViewProfile}
          onEmail={handleEmail}
        />

        {/* Back link */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#6b7280", fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: "4px", padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#3b5bff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to My Courses
          </button>
        </div>

      </div>
    </FacultyLayout>
  );
};

export default ViewStudentsPanel;