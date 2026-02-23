import React from "react";
import FacultyLayout from "../../../components/layout/FacultyLayout";

// Import UI Components
import ClassEnrollmentPanel from "./components/ClassEnrollmentPanel";
import TodaySchedulePanel from "./components/TodaySchedulePanel";
import GradeSubmissionPanel from "./components/GradeSubmissionPanel";
import PendingApprovalPanel from "./components/PendingApprovalPanel";

const DashboardUserName = "James Sok";
const DashboardUserGender = "M";

const DashboardFaculty = () => {
  return (
    <FacultyLayout>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "20px", fontWeight: "500" }}>
          Welcome back, {DashboardUserGender === "M" ? "Mr." : DashboardUserGender === "F" ? "Ms." : ""} {DashboardUserName}
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6b7280" }}>
          Here's what's happening with your courses and students
        </p>
      </div>

      <ClassEnrollmentPanel />
      <div style={{ display: "flex", gap: "24px", alignItems: "stretch", marginTop: "24px" }}>
        <div style={{ flex: 1 }}>
          <TodaySchedulePanel /> 
        </div>
        <div style={{ flex: 1 }}>
          <GradeSubmissionPanel />
        </div>
        <div style={{ flex: 1 }}>
          <PendingApprovalPanel />
        </div>
      </div>
    </FacultyLayout>
  );
};

export default DashboardFaculty;