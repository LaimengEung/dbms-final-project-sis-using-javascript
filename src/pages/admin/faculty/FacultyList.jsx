import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import facultyService from '../../../services/facultyService'
import { Card, Button, Spinner } from '../../../components/ui'
import { SearchBar, ConfirmDialog } from '../../../components/shared'

const FacultyList = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [faculty, setFaculty] = useState([])
  const [filteredFaculty, setFilteredFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' })

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await facultyService.getAll()
      const rows = res.data || []
      setFaculty(rows)
      setFilteredFaculty(rows)
    } catch (err) {
      setError(err.message || 'Failed to load faculty.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaculty()
  }, [])

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFaculty(faculty)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = faculty.filter(item => {
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase()
      return (
        fullName.includes(term) ||
        (item.email || '').toLowerCase().includes(term) ||
        (item.faculty_number || '').toLowerCase().includes(term) ||
        (item.department_name || '').toLowerCase().includes(term) ||
        (item.title || '').toLowerCase().includes(term)
      )
    })
    setFilteredFaculty(filtered)
  }, [searchTerm, faculty])

  const handleDelete = async () => {
    try {
      await facultyService.delete(deleteDialog.id)
      setSuccessMessage(`Faculty "${deleteDialog.name}" deleted successfully.`)
      setDeleteDialog({ isOpen: false, id: null, name: '' })
      fetchFaculty()
    } catch (err) {
      setError(err.message || 'Failed to delete faculty.')
    }
  }

  return (
    <AdminLayout title="Faculty Management">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600">Manage faculty profiles, departments, and offices</p>
        </div>

        {successMessage && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <p className="text-green-800">{successMessage}</p>
          </Card>
        )}

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex-1">
              <SearchBar
                placeholder="Search faculty by name, email, ID, department..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={fetchFaculty}>Refresh</Button>
              <Button onClick={() => navigate('/admin/faculty/create')}>Add Faculty</Button>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="py-12 text-center">
              <Spinner size="lg" />
              <p className="mt-3 text-gray-600">Loading faculty...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                Showing {filteredFaculty.length} of {faculty.length} faculty
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Office</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFaculty.map(item => (
                      <tr key={item.faculty_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.faculty_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.faculty_number || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.first_name} {item.last_name}</div>
                          <div className="text-xs text-gray-500">{item.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.department_name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.title || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.office_location || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium space-x-3">
                          <button className="text-gray-700 hover:text-black" onClick={() => navigate(`/admin/faculty/${item.faculty_id}`)}>View</button>
                          <button className="text-blue-600 hover:text-blue-800" onClick={() => navigate(`/admin/faculty/edit/${item.faculty_id}`)}>Edit</button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => setDeleteDialog({
                              isOpen: true,
                              id: item.faculty_id,
                              name: `${item.first_name} ${item.last_name}`
                            })}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
          onConfirm={handleDelete}
          title="Delete Faculty"
          message={`Are you sure you want to delete "${deleteDialog.name}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </AdminLayout>
  )
}

export default FacultyList

