import FacultyLayout from "../../../components/layout/FacultyLayout";
import RequestTable from "./components/RequestTable";

const defaultRequests = [
  { id: 1, requestId: "REQ2025010", studentName: "James Wilson", studentId: "STU2024005", avatarUrl: null, type: "Grade Appeal",          dateSubmitted: "Jan 18, 2025", status: "pending" },
  { id: 2, requestId: "REQ2025011", studentName: "Lisa Park",    studentId: "STU2024006", avatarUrl: null, type: "Recommendation Letter",  dateSubmitted: "Jan 19, 2025", status: "pending" },
  { id: 3, requestId: "REQ2025012", studentName: "David Kumar",  studentId: "STU2024007", avatarUrl: null, type: "Course Withdrawal",       dateSubmitted: "Jan 20, 2025", status: "pending" },
];

const StudentRequests = ({ requests = defaultRequests }) => {
  const handleApprove = (req) => alert(`Approved: ${req.requestId}`);
  const handleReject  = (req) => alert(`Rejected: ${req.requestId}`);
  const handleView    = (req) => alert(`Viewing: ${req.requestId}`);

  return (
    <FacultyLayout>
      <div>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 500 }}>
            Student Requests
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#6b7280" }}>
            Review and respond to student requests
          </p>
        </div>

        <RequestTable
          requests={requests}
          onApprove={handleApprove}
          onReject={handleReject}
          onView={handleView}
        />
      </div>
    </FacultyLayout>
  );
};

export default StudentRequests;