import { useState } from "react";
import { Calendar, List, Download } from "lucide-react";
import CalendarScheduleView from "./components/CalendarScheduleView";
import ListScheduleView from "./components/ListScheduleView";
import FacultyLayout from "../../../components/layout/FacultyLayout";

const defaultCourses = [
  { id: 1, code: "CS 301", name: "Data Structures",    section: "Section 01", schedule: "MWF 9:00-10:30 AM",  room: "Engineering 201", enrolled: 28, capacity: 30 },
  { id: 2, code: "CS 450", name: "Advanced Algorithms", section: "Section 02", schedule: "TTh 2:00-3:30 PM",   room: "Engineering 203", enrolled: 25, capacity: 30 },
  { id: 3, code: "CS 490", name: "Senior Capstone",     section: "Section 01", schedule: "W 3:00-6:00 PM",     room: "Engineering 210", enrolled: 15, capacity: 20 },
];

const defaultOfficeHours = [
  { id: 1, title: "Regular Office Hours", days: "Monday & Wednesday", time: "2:00 PM – 4:00 PM", location: "Engineering Building, Room 305" },
];

const defaultCalendarEvents = [
  { id: 1, type: "class",  title: "CS 301", subtitle: "Data Structures",    location: "Engineering 201", days: ["Monday", "Wednesday", "Friday"], startHour: 9,  endHour: 10.5 },
  { id: 2, type: "office", title: "Office Hours", subtitle: null,           location: "Engineering Building, Room 305", days: ["Monday", "Wednesday"], startHour: 14, endHour: 16 },
];

const MySchedule = ({
  courses = defaultCourses,
  officeHours = defaultOfficeHours,
  calendarEvents = defaultCalendarEvents,
}) => {
  const [view, setView] = useState("calendar"); // "calendar" | "list"

  const handleExport = () => {
    alert("Exporting schedule...");
  };

  return (
    <FacultyLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>My Schedule</h1>
            <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6b7280" }}>View your teaching schedule and office hours</p>
          </div>

          {/* Toggle + Export */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

            {/* Calendar / List toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <button
                onClick={() => setView("calendar")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  border: "none",
                  borderRight: "1px solid #d1d5db",
                  cursor: "pointer",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundColor: view === "calendar" ? "#3b5bff" : "#fff",
                  color: view === "calendar" ? "#fff" : "#374151",
                  transition: "background-color 0.15s, color 0.15s",
                }}
              >
                <Calendar size={15} />
                Calendar
              </button>
              <button
                onClick={() => setView("list")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundColor: view === "list" ? "#3b5bff" : "#fff",
                  color: view === "list" ? "#fff" : "#374151",
                  transition: "background-color 0.15s, color 0.15s",
                }}
              >
                <List size={15} />
                List
              </button>
            </div>

            {/* Export button */}
            <button
              onClick={handleExport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "#fff",
                color: "#374151",
                fontSize: "13.5px",
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              <Download size={15} />
              Export
            </button>
          </div>
        </div>

        {/* View content */}
        {view === "calendar" ? (
          <CalendarScheduleView events={calendarEvents} />
        ) : (
          <ListScheduleView courses={courses} officeHours={officeHours} />
        )}

      </div>
    </FacultyLayout>
  );
};

export default MySchedule;