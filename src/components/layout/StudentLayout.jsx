import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { BookOpen, GraduationCap, LayoutDashboard, Settings, User } from 'lucide-react';

const studentMenu = [
  { icon: <LayoutDashboard />, label: 'Dashboard', path: '/student' },
];

const studentUser = {
  name: 'Student User',
  email: 'student@school.edu',
  initials: 'S',
  role: 'Student',
};

const studentNotifications = [
  { id: 1, title: 'Enrollment status updated', time: '10 min ago', unread: true },
  { id: 2, title: 'New grade posted', time: '1 day ago', unread: false },
];

const studentProfileLinks = [
  { label: 'My Dashboard', path: '/student', icon: <User size={16} /> },
  { label: 'Settings', path: '/student', icon: <Settings size={16} /> },
];

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        menuItems={studentMenu}
        user={studentUser}
        logo={{ icon: <GraduationCap />, label: 'SchoolStudent' }}
        onLogout={handleLogout}
      />
      <div className="md:pl-64">
        <Header
          user={studentUser}
          logo={{ icon: <BookOpen size={20} className="text-white" />, label: 'SchoolStudent' }}
          notifications={studentNotifications}
          profileLinks={studentProfileLinks}
          searchPlaceholder="Search courses, sections..."
          onLogout={handleLogout}
        />
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;
