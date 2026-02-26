import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui';
import EnrollmentForm from './components/EnrollmentForm';
import enrollmentService from '../../../services/enrollmentService';
import studentService from '../../../services/studentService';

const EnrollmentCreate = () => {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [hasStudents, setHasStudents] = useState(false);
  const [hasSections, setHasSections] = useState(false);
  const [prereqChecked, setPrereqChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [semestersRes, studentsRes, sectionsRes] = await Promise.all([
          enrollmentService.getSemesters(),
          studentService.getAll({ limit: 1 }),
          enrollmentService.getSectionsBySemester(undefined),
        ]);

        setSemesters(semestersRes.data || []);
        setHasStudents((studentsRes.data || []).length > 0);
        setHasSections((sectionsRes.data || []).length > 0);
      } finally {
        setPrereqChecked(true);
      }
    };

    loadPrerequisites();
  }, []);

  const missingPrerequisites = prereqChecked && (!semesters.length || !hasStudents || !hasSections);

  const handleSubmit = async (data) => {
    if (missingPrerequisites) return;
    setLoading(true);
    try {
      await enrollmentService.create(data);
      navigate('/admin/enrollments', { state: { message: 'Enrollment created!' } });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">New Enrollment</h1>
      <Card className="p-6">
        {missingPrerequisites && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            No semesters/students/sections found. Please create them first.
          </div>
        )}
        <EnrollmentForm 
          onSubmit={handleSubmit}
          isLoading={loading}
          semesters={semesters}
          disableSubmit={missingPrerequisites}
        />
      </Card>
    </div>
  );
};

export default EnrollmentCreate;
