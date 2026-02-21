import React from 'react'
import FacultyLayout from '../../../components/layout/FacultyLayout'

// Import UI Components
import EnrollmentBar from '../../../components/ui/EnrollmentBar'
import ClassEnrollCard from '../../../components/ui/ClassEnrollCard'
import ClassEnrollmentPanel from '../../../components/ui/ClassEnrollmentPanel'

const DashboardFaculty = () => {
  return (
    <FacultyLayout>
      <ClassEnrollmentPanel/>
    </FacultyLayout>
  )
}

export default DashboardFaculty;    