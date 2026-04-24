import api from './axios'

export const getConversations = () => api.get('/chat/')
export const startConversation = (listingId) => api.post(`/chat/start/${listingId}/`)
export const getMessages = (convId) => api.get(`/chat/${convId}/messages/`)
export const sendMessage = (convId, text) => api.post(`/chat/${convId}/send/`, { text })
export const getUnreadCount = () => api.get('/chat/unread/')