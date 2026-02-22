import api from './api'

const studentService = {
  async getAll(params = {}) {
    const response = await api.get('/students', { params })
    const data = Array.isArray(response.data) ? response.data : response.data?.data || []
    return { data, status: response.status }
  },

  async getById(id) {
    const response = await api.get(`/students/${id}`)
    return { data: response.data?.data || response.data, status: response.status }
  },

  async create(studentData) {
    const response = await api.post('/students', studentData)
    return {
      data: response.data?.data || response.data,
      status: response.status,
<<<<<<< HEAD
      message: response.data?.message || 'Student created successfully!'
=======
      message: response.data?.message || 'Student created successfully!',
>>>>>>> ab345606e178b1fe8caa63479a7129ff7ec1a4d9
    }
  },

  async update(id, studentData) {
    const response = await api.put(`/students/${id}`, studentData)
    return {
      data: response.data?.data || response.data,
      status: response.status,
<<<<<<< HEAD
      message: response.data?.message || 'Student updated successfully!'
=======
      message: response.data?.message || 'Student updated successfully!',
>>>>>>> ab345606e178b1fe8caa63479a7129ff7ec1a4d9
    }
  },

  async delete(id) {
    const response = await api.delete(`/students/${id}`)
    return {
      data: response.data?.data || {},
      status: response.status,
<<<<<<< HEAD
      message: response.data?.message || 'Student deleted successfully!'
=======
      message: response.data?.message || 'Student deleted successfully!',
>>>>>>> ab345606e178b1fe8caa63479a7129ff7ec1a4d9
    }
  },

  async getEnrollments(studentId) {
    const response = await api.get(`/students/${studentId}/enrollments`)
    const data = Array.isArray(response.data) ? response.data : response.data?.data || []
    return { data, status: response.status }
<<<<<<< HEAD
  }
=======
  },
>>>>>>> ab345606e178b1fe8caa63479a7129ff7ec1a4d9
}

export default studentService
