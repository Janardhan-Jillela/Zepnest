import api from './axios';

export const createRequest = (data) => api.post('/requests', data);
export const getRequests = (params) => api.get('/requests', { params });
export const getRequest = (id) => api.get(`/requests/${id}`);
export const updateRequest = (id, data) => api.put(`/requests/${id}`, data);
export const updateStatus = (id, status) => api.patch(`/requests/${id}/status`, { status });
export const deleteRequest = (id) => api.delete(`/requests/${id}`);
export const getStats = () => api.get('/requests/stats');
export const uploadImage = (id, formData) =>
  api.post(`/requests/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
