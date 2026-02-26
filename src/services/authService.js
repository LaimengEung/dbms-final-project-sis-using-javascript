import api from './api'

const authService = {
  async login(payload) {
    const response = await api.post('/auth/login', payload)
    return response.data
  },
}

export default authService
