import api from './axios'

export const register = (data) => api.post('/accounts/register/', data)
export const login = (data) => api.post('/accounts/login/', data)
export const getProfile = () => api.get('/accounts/profile/')
export const updateProfile = (data) => api.patch('/accounts/profile/', data)
export const changePassword = (data) => api.post('/accounts/profile/change-password/', data)