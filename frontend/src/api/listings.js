import api from './axios'

export const getListings = (params) => api.get('/listings/', { params })
export const getListing = (id) => api.get(`/listings/${id}/`)
export const createListing = (data) => api.post('/listings/create/', data)
export const updateListing = (id, data) => api.patch(`/listings/${id}/`, data)
export const deleteListing = (id) => api.delete(`/listings/${id}/`)
export const getMyListings = () => api.get('/listings/my/')
export const getCategories = () => api.get('/listings/categories/')
export const toggleFavorite = (id) => api.post(`/listings/${id}/favorite/`)
export const getFavorites = () => api.get('/listings/favorites/')
export const searchListings = (params) => api.get('/search/', { params })