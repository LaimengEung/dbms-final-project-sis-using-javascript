import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';

import HomeDefault from './pages/HomeDefault';
import Dashboard from './pages/admin/dashboard/Dashboard';
import UserList from './pages/admin/users/UserList';
import UserCreate from './pages/admin/users/UserCreate';
import UserEdit from './pages/admin/users/UserEdit';
import StudentList from './pages/admin/students/StudentList';
import StudentCreate from './pages/admin/students/StudentCreate';
import StudentEdit from './pages/admin/students/StudentEdit';
import StudentView from './pages/admin/students/StudentView';
import EnrollmentList from './pages/admin/enrollments/EnrollmentList';
import EnrollmentCreate from './pages/admin/enrollments/EnrollmentCreate';
import EnrollmentEdit from './pages/admin/enrollments/EnrollmentEdit';
import EnrollmentView from './pages/admin/enrollments/EnrollmentView';
import FacultyList from './pages/admin/faculty/FacultyList';
import FacultyCreate from './pages/admin/faculty/FacultyCreate';
import FacultyEdit from './pages/admin/faculty/FacultyEdit';
import FacultyView from './pages/admin/faculty/FacultyView';
import SemesterList from './pages/admin/semesters/SemesterList';
import DashboardFaculty from './pages/faculty/dashboard/DashboardFaculty';
import MyCourses from './pages/faculty/myCourses/MyCourses';
import MySchedule from './pages/faculty/mySchedule/MySchedule';
import DashboardStudent from './pages/student/dashboard/DashboardStudent';
import RoleLogin from './pages/auth/RoleLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GradeManagement from './pages/faculty/gradeManagement/GradeManagement';
import StudentRequests from './pages/faculty/studentRequests/StudentRequests';
import ViewStudentsPanel from './pages/faculty/dashboard/components/ViewStudentsPanel';
import ManageGradePanel from './pages/faculty/dashboard/components/ManageGradePanel';


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Root */}
          <Route path="/" element={<HomeDefault />} />
          <Route path="/login" element={<Navigate to="/login/student" replace />} />
          <Route path="/login/:role" element={<RoleLogin />} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<Dashboard />} />

          {/* Faculty */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'faculty']}>
                <DashboardFaculty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/myCourses"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'faculty']}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/mySchedule"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'faculty']}>
                <MySchedule />
              </ProtectedRoute>
            }
          />

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar"
            element={
              <ProtectedRoute allowedRoles={['registrar']}>
                <Navigate to="/" replace />
              </ProtectedRoute>
            }
          />
          <Route path="/faculty" element={<DashboardFaculty />} />
          <Route path="/faculty/courses/:courseId/students" element={<ViewStudentsPanel />} />
          <Route path="/faculty/courses/:courseId/grades" element={<ManageGradePanel />} />
          <Route path="/faculty/myCourses" element={<MyCourses />} />
          <Route path="/faculty/mySchedule" element={<MySchedule />} />
          <Route path="/faculty/gradeManagement" element={<GradeManagement />} />
          <Route path="/faculty/studentRequests" element={<StudentRequests />} />

          {/* User routes */}
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/users/create" element={<UserCreate />} />
          <Route path="/admin/users/edit/:id" element={<UserEdit />} />

          {/* Admin Students */}
          <Route path="/admin/students" element={<StudentList />} />
          <Route path="/admin/students/create" element={<StudentCreate />} />
          <Route path="/admin/students/edit/:id" element={<StudentEdit />} />
          <Route path="/admin/students/:id" element={<StudentView />} />

          {/* Admin Enrollments */}
          <Route path="/admin/enrollments" element={<EnrollmentList />} />
          <Route path="/admin/enrollments/create" element={<EnrollmentCreate />} />
          <Route path="/admin/enrollments/edit/:id" element={<EnrollmentEdit />} />
          <Route path="/admin/enrollments/:id" element={<EnrollmentView />} />

          {/* Admin Faculty */}
          <Route path="/admin/faculty" element={<FacultyList />} />
          <Route path="/admin/faculty/create" element={<FacultyCreate />} />
          <Route path="/admin/faculty/edit/:id" element={<FacultyEdit />} />
          <Route path="/admin/faculty/:id" element={<FacultyView />} />

          {/* Admin Semesters */}
          <Route path="/admin/semesters" element={<SemesterList />} />

          {/* Optional legacy support */}
          <Route path="/enrollments" element={<Navigate to="/admin/enrollments" replace />} />
          <Route path="/admin/academics" element={<Navigate to="/admin/semesters" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
