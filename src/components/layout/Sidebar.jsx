import React, { useState } from 'react';
import { 
  FiHome, FiUsers, FiUser, FiBookOpen, 
  FiClipboard, FiBarChart2, FiDollarSign,
  FiSettings, FiChevronLeft, FiChevronRight,
  FiLogOut, FiGrid, FiFileText, FiBell
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
// REMOVED: import Badge from '../ui/Badge';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/admin' },
    { 
      icon: <FiUsers />, 
      label: 'Users', 
      path: '/admin/users',
      badge: '3'
    },
    { 
      icon: <FiUser />, 
      label: 'Students', 
      path: '/admin/students',
      badge: '12'
    },
    { icon: <FiBookOpen />, label: 'Faculty', path: '/admin/faculty' },
    { icon: <FiGrid />, label: 'Academics', path: '/admin/academics' },
    { icon: <FiClipboard />, label: 'Enrollments', path: '/admin/enrollments' },
    { icon: <FiFileText />, label: 'Grades', path: '/admin/grades' },
    { icon: <FiDollarSign />, label: 'Finance', path: '/admin/finance' },
    { icon: <FiBarChart2 />, label: 'Reports', path: '/admin/reports' },
    { icon: <FiSettings />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <FiBookOpen className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-gray-900">SchoolAdmin</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <FiBookOpen className="text-white" size={18} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)] scrollbar-hide">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-colors relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="ml-3 flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className={`absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 ${collapsed ? 'px-2' : 'px-4'}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold">A</span>
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@school.edu</p>
            </div>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiLogOut className="text-gray-600" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;