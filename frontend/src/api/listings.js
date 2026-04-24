import api from './axios'

export const getListings = (params) => api.get('/listings/', { params })
export const getListing = (id) => api.get(`/listings/${id}/`)
export const createListing = (data) => api.post('/listings/create/', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const updateListing = (id, data) => api.patch(`/listings/${id}/`, data)
export const deleteListing = (id) => api.delete(`/listings/${id}/`)
export const getMyListings = () => api.get('/listings/my/')
export const getCategories = () => api.get('/listings/categories/')
export const toggleFavorite = (id) => api.post(`/listings/${id}/favorite/`)
export const getFavorites = () => api.get('/listings/favorites/')
export const searchListings = (params) => api.get('/search/', { params })
export const addListingImages = (id, data) => api.post(`/listings/${id}/images/add/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const deleteListingImage = (id, imageId) => api.delete(`/listings/${id}/images/${imageId}/delete/`)
export const setMainImage = (id, imageId) => api.post(`/listings/${id}/images/${imageId}/main/`)