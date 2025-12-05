'use client'

import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

const stats = [
  {
    name: 'Total Students',
    value: '2,543',
    change: '+12%',
    trend: 'up',
    icon: GraduationCap,
    color: 'bg-blue-500'
  },
  {
    name: 'Total Staff',
    value: '186',
    change: '+3%',
    trend: 'up',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    name: 'Active Classes',
    value: '48',
    change: '0%',
    trend: 'neutral',
    icon: BookOpen,
    color: 'bg-purple-500'
  },
  {
    name: 'Fee Collection',
    value: '₹45.2L',
    change: '+18%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-yellow-500'
  },
]

const recentActivities = [
  { action: 'New student admission', name: 'Rahul Kumar', time: '2 mins ago' },
  { action: 'Fee payment received', name: 'Priya Sharma', time: '15 mins ago' },
  { action: 'Library book issued', name: 'Amit Patel', time: '1 hour ago' },
  { action: 'Staff leave approved', name: 'Mrs. Singh', time: '2 hours ago' },
  { action: 'Transport route updated', name: 'Route #5', time: '3 hours ago' },
]

const upcomingEvents = [
  { title: 'Parent-Teacher Meeting', date: 'Dec 10, 2025', time: '10:00 AM' },
  { title: 'Annual Sports Day', date: 'Dec 15, 2025', time: '8:00 AM' },
  { title: 'Mid-term Exams', date: 'Dec 20, 2025', time: '9:00 AM' },
  { title: 'Winter Break Starts', date: 'Dec 25, 2025', time: 'All Day' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : stat.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    ) : null}
                    <span className={`text-sm ${
                      stat.trend === 'up' ? 'text-green-500' :
                      stat.trend === 'down' ? 'text-red-500' :
                      'text-gray-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.name}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-sm">
                    {event.date.split(' ')[1].replace(',', '')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <GraduationCap className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Student</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Staff</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <DollarSign className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Collect Fee</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <BookOpen className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Issue Book</p>
          </button>
        </div>
      </div>
    </div>
  )
}
