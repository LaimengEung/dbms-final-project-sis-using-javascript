import React, { useEffect, useMemo, useState } from 'react';
import StudentLayout from '../../../components/layout/StudentLayout';
import { Alert, Badge, Card, Select, Spinner, Table } from '../../../components/ui';
import studentService from '../../../services/studentService';

const DashboardStudent = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [error, setError] = useState('');

  const selectedStudent = useMemo(
    () => students.find((s) => Number(s.student_id) === Number(selectedStudentId)),
    [students, selectedStudentId]
  );

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await studentService.getAll({ limit: 100 });
        const list = Array.isArray(response?.data) ? response.data : [];
        setStudents(list);
        if (list.length > 0) {
          setSelectedStudentId(String(list[0].student_id));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load students for dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  useEffect(() => {
    const loadEnrollments = async () => {
      if (!selectedStudentId) {
        setEnrollments([]);
        return;
      }
      try {
        setLoadingEnrollments(true);
        const response = await studentService.getEnrollments(selectedStudentId);
        setEnrollments(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        console.error(err);
        setEnrollments([]);
      } finally {
        setLoadingEnrollments(false);
      }
    };

    loadEnrollments();
  }, [selectedStudentId]);

  const stats = useMemo(() => {
    const totalCourses = enrollments.length;
    const completed = enrollments.filter((e) => String(e.status).toLowerCase() === 'completed').length;
    const active = enrollments.filter((e) => String(e.status).toLowerCase() === 'enrolled').length;
    const totalCredits = enrollments.reduce((sum, e) => sum + Number(e.credits || 0), 0);
    return { totalCourses, completed, active, totalCredits };
  }, [enrollments]);

  const enrollmentColumns = [
    { key: 'course_name', header: 'Course' },
    { key: 'semester', header: 'Semester' },
    { key: 'credits', header: 'Credits' },
    {
      key: 'grade',
      header: 'Grade',
      render: (value) => value || 'In Progress',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <Badge color={String(value).toLowerCase() === 'completed' ? 'green' : 'blue'}>{value}</Badge>,
    },
  ];

  const studentOptions = students.map((s) => ({
    value: String(s.student_id),
    label: `${s.first_name} ${s.last_name} (#${s.student_id})`,
  }));

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your courses, credits, and current enrollment status.</p>
        </div>

        {error && <Alert type="error" title="Dashboard Error" message={error} />}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Select
                  label="Select Student"
                  options={studentOptions}
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  placeholder="Choose student"
                />
                <div className="md:col-span-2">
                  {selectedStudent ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-900">
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{selectedStudent.email}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Student #{selectedStudent.student_number} | Major: {selectedStudent.major_name || 'Undeclared'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No student selected.</div>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card>
                <div className="text-sm text-gray-500">Total Courses</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Active Enrollments</div>
                <div className="text-3xl font-bold text-blue-600 mt-1">{stats.active}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Completed</div>
                <div className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Total Credits</div>
                <div className="text-3xl font-bold text-purple-600 mt-1">{stats.totalCredits}</div>
              </Card>
            </div>

            <Card title="My Enrollments" subtitle="Courses and grade progress">
              {loadingEnrollments ? (
                <div className="py-12 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <Table columns={enrollmentColumns} data={enrollments} />
              )}
            </Card>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default DashboardStudent;
