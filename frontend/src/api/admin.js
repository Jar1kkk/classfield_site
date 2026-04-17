import api from './axios'

export const getAdminStats = () => api.get('/accounts/admin/stats/')
export const getAdminListings = () => api.get('/accounts/admin/listings/')
export const getAdminUsers = () => api.get('/accounts/admin/users/')
export const updateListingStatus = (id, status) =>
  api.patch(`/accounts/admin/listings/${id}/status/`, { status })
export const adminDeleteListing = (id) =>
  api.delete(`/accounts/admin/listings/${id}/delete/`)
export const getAdminCategories = () => api.get('/accounts/admin/categories/')
export const createAdminCategory = (data) => api.post('/accounts/admin/categories/', data)
export const deleteAdminCategory = (id) => api.delete(`/accounts/admin/categories/${id}/`)