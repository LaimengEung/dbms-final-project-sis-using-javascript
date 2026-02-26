import React from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'

// Import UI components
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Progress from '../../../components/ui/Progress' // If you have one
import Table from '../../../components/ui/Table' // If you need tables

// Icons
import {
  Users, GraduationCap, BookOpen, TrendingUp, Clock,
  DollarSign, FileText, CheckCircle, AlertCircle,
  Calendar, BarChart3, Award, Activity, RefreshCw,
  ArrowRight, Download, Eye, Plus, Settings
} from 'lucide-react'

const Dashboard = () => {
  // Stats Data
  const statCards = [
    { 
      title: 'Total Students', 
      value: '1,254', 
      change: '+12%', 
      icon: <GraduationCap size={24} />,
      color: 'blue',
      trend: 'up'
    },
    { 
      title: 'Total Faculty', 
      value: '86', 
      change: '+5%', 
      icon: <Users size={24} />,
      color: 'green',
      trend: 'up'
    },
    { 
      title: 'Active Courses', 
      value: '48', 
      change: '+8%', 
      icon: <BookOpen size={24} />,
      color: 'purple',
      trend: 'up'
    },
    { 
      title: "Today's Attendance", 
      value: '94%', 
      change: '+2%', 
      icon: <CheckCircle size={24} />,
      color: 'yellow',
      trend: 'up'
    }
  ]

  // Quick Stats
  const quickStats = [
    { 
      title: 'Pending Approvals', 
      value: '23', 
      color: 'blue',
      icon: <Clock size={18} />
    },
    { 
      title: 'Unpaid Fees', 
      value: '45', 
      color: 'red',
      icon: <DollarSign size={18} />
    },
    { 
      title: 'New Registrations', 
      value: '12', 
      color: 'green',
      icon: <TrendingUp size={18} />
    },
    { 
      title: 'Assignments Due', 
      value: '18', 
      color: 'purple',
      icon: <FileText size={18} />
    }
  ]

  // Recent Activity
  const activities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'enrolled in CS101',
      time: '10 minutes ago',
      icon: <GraduationCap size={16} />,
      color: 'blue'
    },
    {
      id: 2,
      user: 'Sarah Smith',
      action: 'submitted assignment',
      time: '30 minutes ago',
      icon: <FileText size={16} />,
      color: 'green'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'paid tuition fee',
      time: '1 hour ago',
      icon: <DollarSign size={16} />,
      color: 'yellow'
    },
    {
      id: 4,
      user: 'Emma Wilson',
      action: 'requested course change',
      time: '2 hours ago',
      icon: <AlertCircle size={16} />,
      color: 'orange'
    },
    {
      id: 5,
      user: 'Admin',
      action: 'added new faculty member',
      time: '3 hours ago',
      icon: <Users size={16} />,
      color: 'purple'
    }
  ]

  // Upcoming Events
  const events = [
    { id: 1, title: 'Faculty Meeting', time: 'Today, 2:00 PM', type: 'meeting' },
    { id: 2, title: 'Final Exam Week', time: 'Dec 15-20', type: 'exam' },
    { id: 3, title: 'Parent-Teacher Conference', time: 'Tomorrow, 10:00 AM', type: 'conference' },
    { id: 4, title: 'Sports Day', time: 'Friday, 9:00 AM', type: 'event' }
  ]

  return (
    <AdminLayout title="Dashboard">
      <div className="p-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to School Admin</h1>
            <p className="text-gray-600">Manage your school efficiently</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center">
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button variant="primary" className="flex items-center">
              <Plus size={16} className="mr-2" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-l-4" style={{ borderLeftColor: `var(--color-${stat.color})` }}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <div className={`text-${stat.color}-600`}>
                      {stat.icon}
                    </div>
                  </div>
                  <Badge color={stat.trend === 'up' ? 'green' : 'red'} variant="outline">
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-500 text-sm">{stat.title}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Middle Section - Quick Stats & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
                  <Settings size={18} className="text-gray-400 cursor-pointer" />
                </div>
                <div className="space-y-4">
                  {quickStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-${stat.color}-100 mr-3`}>
                          <div className={`text-${stat.color}-600`}>
                            {stat.icon}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                        </div>
                      </div>
                      <span className={`text-lg font-bold text-${stat.color}-600`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <Button variant="link" size="sm" className="flex items-center">
                    View All
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 flex items-center justify-center mr-4`}>
                          <div className={`text-${activity.color}-600`}>
                            {activity.icon}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            <span className="font-semibold">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Upcoming Events & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <Calendar size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.time}</p>
                        </div>
                      </div>
                      <Badge color="blue" variant="outline">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button variant="primary" fullWidth className="justify-start">
                    <Users size={16} className="mr-3" />
                    Manage Users
                  </Button>
                  
                  <Button variant="outline" fullWidth className="justify-start">
                    <GraduationCap size={16} className="mr-3" />
                    Add Student
                  </Button>
                  
                  <Button variant="outline" fullWidth className="justify-start">
                    <BookOpen size={16} className="mr-3" />
                    Create Course
                  </Button>
                  
                  <Button variant="outline" fullWidth className="justify-start">
                    <BarChart3 size={16} className="mr-3" />
                    View Reports
                  </Button>
                  
                  <Button variant="outline" fullWidth className="justify-start">
                    <DollarSign size={16} className="mr-3" />
                    Finance Overview
                  </Button>
                  
                  <Button variant="outline" fullWidth className="justify-start">
                    <Settings size={16} className="mr-3" />
                    System Settings
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
                  <p className="text-gray-600">All systems operational • Last updated: Today 10:30 AM</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <Badge color="green" className="px-3 py-1">
                    <Activity size={12} className="mr-1" />
                    Online
                  </Badge>
                  <div className="text-sm text-gray-500">
                    API Response: <span className="font-semibold text-green-600">32ms</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard