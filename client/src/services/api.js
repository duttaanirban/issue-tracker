import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const fetchIssues = (params) => API.get('/issues', {
  params: Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  ),
});
export const fetchIssueById = (id) => API.get(`/issues/${id}`);
export const createIssue = (data) => API.post('/issues', data);
export const createComment = (issueId, data) => API.post(`/issues/${issueId}/comments`, data);
export const updateIssue = (id, data) => API.patch(`/issues/${id}`, data);