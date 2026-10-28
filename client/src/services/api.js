import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const fetchIssues = (params) => API.get('/issues', { params });
export const fetchIssueById = (id) => API.get(`/issues/${id}`);
export const createComment = (issueId, data) => API.post(`/issues/${issueId}/comments`, data);
export const updateIssue = (id, data) => API.patch(`/issues/${id}`, data);