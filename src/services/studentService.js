// src/services/studentService.js - 100% WORKING VERSION
const STORAGE_KEY = 'school_students'

const studentService = {
  // Get initial data
  getInitialData: () => [
    { 
      student_id: 1, 
      student_number: 'STU001', 
      first_name: 'John', 
      last_name: 'Doe', 
      email: 'john@school.edu',
      classification: 3,
      major_name: 'Computer Science',
      gpa: 3.8,
      academic_standing: 'Good',
      credits_earned: 90
    }
  ],

  // Get all students (reads from localStorage)
  getAll: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        try {
          const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || studentService.getInitialData()
          resolve({
            data: data,
            status: 200,
            message: 'Success'
          })
        } catch (error) {
          resolve({
            data: studentService.getInitialData(),
            status: 200,
            message: 'Using default data'
          })
        }
      }, 100)
    })
  },

  // Create new student - SIMPLIFIED
  create: async (studentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Get current students
          let currentStudents = []
          try {
            currentStudents = JSON.parse(localStorage.getItem(STORAGE_KEY)) || studentService.getInitialData()
          } catch {
            currentStudents = studentService.getInitialData()
          }
          
          // Generate new ID (max existing ID + 1)
          const maxId = currentStudents.length > 0 
            ? Math.max(...currentStudents.map(s => s.student_id || 0)) 
            : 0
          
          // Create new student
          const newStudent = {
            ...studentData,
            student_id: maxId + 1,
            student_number: studentData.student_number || `STU${String(maxId + 1).padStart(3, '0')}`
          }
          
          // Add to list
          const updatedStudents = [...currentStudents, newStudent]
          
          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStudents))
          
          resolve({
            data: newStudent,
            status: 201,
            message: 'Student created successfully!'
          })
        } catch (error) {
          console.error('Create error:', error)
          reject({
            status: 500,
            message: 'Failed to create student'
          })
        }
      }, 100)
    })
  },

  // DELETE STUDENT - 100% WORKING VERSION
  delete: async (id) => {
    console.log('🔴 DELETE CALLED with id:', id, 'type:', typeof id)
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Get current data
          let currentStudents = []
          try {
            currentStudents = JSON.parse(localStorage.getItem(STORAGE_KEY)) || studentService.getInitialData()
          } catch {
            currentStudents = studentService.getInitialData()
          }
          
          console.log('📊 Before delete - Students:', currentStudents)
          console.log('🎯 Looking for id:', id)
          
          // Convert id to number for comparison
          const deleteId = Number(id)
          console.log('🔄 Converted id to number:', deleteId)
          
          // Find index of student to delete
          const index = currentStudents.findIndex(student => {
            console.log(`Comparing: ${student.student_id} (${typeof student.student_id}) === ${deleteId} (${typeof deleteId}) = ${student.student_id === deleteId}`)
            return student.student_id === deleteId
          })
          
          console.log('🔍 Found at index:', index)
          
          if (index === -1) {
            console.error('❌ Student not found with id:', deleteId)
            reject({
              status: 404,
              message: `Student with ID ${deleteId} not found`
            })
            return
          }
          
          // Remove the student
          const deletedStudent = currentStudents[index]
          currentStudents.splice(index, 1)
          
          console.log('🗑️ Deleted student:', deletedStudent)
          console.log('📊 After delete - Students:', currentStudents)
          
          // Save back to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStudents))
          
          console.log('💾 Saved to localStorage')
          
          resolve({
            status: 200,
            message: 'Student deleted successfully!',
            data: { deletedId: deleteId }
          })
          
        } catch (error) {
          console.error('❌ Delete error:', error)
          reject({
            status: 500,
            message: 'Failed to delete student: ' + error.message
          })
        }
      }, 100)
    })
  }
}

// Export for testing in console
if (typeof window !== 'undefined') {
  window.studentService = studentService
}

export default studentService