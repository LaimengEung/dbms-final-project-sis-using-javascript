import { useState } from "react";

import FacultyLayout from "../../../components/layout/FacultyLayout"
import ClassEnrollCard from "./components/ClassEnrollCard";
import SemesterDropdown from "./components/SemesterDropdown";

const defaultCourses = [
  {
    id: 1,
    code: "CS 301",
    name: "Data Structures",
    section: "Section 01",
    semester: "Spring 2025",
    schedule: "MWF 9:00-10:30 AM",
    room: "Engineering 201",
    enrolled: 28,
    capacity: 30,
  },
  {
    id: 2,
    code: "CS 450",
    name: "Advanced Algorithms",
    section: "Section 02",
    semester: "Spring 2025",
    schedule: "TTh 2:00-3:30 PM",
    room: "Engineering 203",
    enrolled: 25,
    capacity: 30,
  },
  {
    id: 3,
    code: "CS 490",
    name: "Senior Capstone",
    section: "Section 01",
    semester: "Spring 2025",
    schedule: "W 3:00-6:00 PM",
    room: "Engineering 210",
    enrolled: 15,
    capacity: 20,
  },
];


const MyCourses = ({ courses = defaultCourses }) => {
  const [selectedSemester, setSelectedSemester] = useState(null);
  const filteredCourses = selectedSemester
    ? courses.filter((c) => c.semester === selectedSemester)
    : courses;
  const handleViewStudents = (course) =>
    alert(`Viewing students for ${course.code}`);
  const handleManageGrades = (course) =>
    alert(`Managing grades for ${course.code}`);

  return (
      <FacultyLayout>
        <div 
          className="Title-Section" 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "20px"
          }}
        >
          <div>
            <h1
              className="Page-Title"
              style={{ fontSize: "20px", fontWeight: "500" }}
            >
              My Courses
            </h1>
            <p className="Page-Subtitle">
              Manage your courses and students 
            </p>
          </div>

          <div>
            <SemesterDropdown 
              value={selectedSemester}
              onChange={setSelectedSemester}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "18px",
          }}
        >
          {filteredCourses.map((course) => (
            <ClassEnrollCard
              key={course.id}
              course={course}
              onViewStudents={handleViewStudents}
              onManageGrades={handleManageGrades}
            />
          ))}
        </div>
      </FacultyLayout>
  );
};

export default MyCourses;