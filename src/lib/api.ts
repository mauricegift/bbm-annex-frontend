import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // I use my backend_api_url in vercel.json so the app will appear as a fullstack app
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let onAuthError: (() => void) | null = null;
export function setAuthErrorHandler(handler: () => void) {
  onAuthError = handler;
}

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (onAuthError) onAuthError();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    name: string;
    password: string;
    year_of_study: number;
    semester_of_study: number;
    specialization?: string;
    verification_method: 'email' | 'sms';
    phone_number?: string;
  }) => api.post('/auth/register', userData),

  login: (credentials: { login: string; password: string; remember_me?: boolean }) =>
    api.post('/auth/login', credentials),

  verify: (data: { email: string; code: string }) =>
    api.post('/auth/verify', data),

  resendVerification: (email: string) =>
    api.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`),

  forgotPassword: (emailOrPhone: string) =>
    api.post('/auth/forgot-password', { email_or_phone: emailOrPhone }),

  resetPassword: (data: { email_or_phone: string; code: string; new_password: string }) =>
    api.post('/auth/reset-password', data),

  requestAccountDeletion: (verificationMethod: 'email' | 'sms') =>
    api.post(`/auth/request-account-deletion?verification_method=${verificationMethod}`),

  confirmAccountDeletion: (data: { email_or_phone: string; code: string; verification_method: 'email' | 'sms' }) =>
    api.post('/auth/confirm-account-deletion', data),
};

// Reviews API
export const reviewsAPI = {
  addNoteReview: (noteId: string, data: { content: string; rating: number }) =>
    api.post(`/notes/${noteId}/review`, data),
  addPaperReview: (paperId: string, data: { content: string; rating: number }) =>
    api.post(`/past-papers/${paperId}/review`, data),
  addBlogReview: (blogId: string, data: { content: string; rating: number }) =>
    api.post(`/blogs/${blogId}/review`, data),
  getNoteReviews: (noteId: string) => api.get(`/notes/${noteId}/reviews`),
  getPaperReviews: (paperId: string) => api.get(`/past-papers/${paperId}/reviews`),
  getBlogReviews: (blogId: string) => api.get(`/blogs/${blogId}/reviews`),
  deleteNoteReview: (noteId: string, reviewId: string) => api.delete(`/notes/${noteId}/reviews/${reviewId}`),
  deletePaperReview: (paperId: string, reviewId: string) => api.delete(`/past-papers/${paperId}/reviews/${reviewId}`),
  deleteBlogReview: (blogId: string, reviewId: string) => api.delete(`/blogs/${blogId}/reviews/${reviewId}`),
  // Admin review moderation
  replyToNoteReview: (noteId: string, reviewId: string, reply: string) =>
    api.post(`/notes/${noteId}/reviews/${reviewId}/reply`, { reply }),
  replyToPaperReview: (paperId: string, reviewId: string, reply: string) =>
    api.post(`/past-papers/${paperId}/reviews/${reviewId}/reply`, { reply }),
  replyToBlogReview: (blogId: string, reviewId: string, reply: string) =>
    api.post(`/blogs/${blogId}/reviews/${reviewId}/reply`, { reply }),
  flagNoteReview: (noteId: string, reviewId: string) =>
    api.post(`/notes/${noteId}/reviews/${reviewId}/flag`),
  flagPaperReview: (paperId: string, reviewId: string) =>
    api.post(`/past-papers/${paperId}/reviews/${reviewId}/flag`),
  flagBlogReview: (blogId: string, reviewId: string) =>
    api.post(`/blogs/${blogId}/reviews/${reviewId}/flag`),
  approveNoteReview: (noteId: string, reviewId: string) =>
    api.post(`/notes/${noteId}/reviews/${reviewId}/approve`),
  approvePaperReview: (paperId: string, reviewId: string) =>
    api.post(`/past-papers/${paperId}/reviews/${reviewId}/approve`),
  approveBlogReview: (blogId: string, reviewId: string) =>
    api.post(`/blogs/${blogId}/reviews/${reviewId}/approve`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: {
    name: string;
    year_of_study: number;
    semester_of_study: number;
    specialization?: string;
  }) => api.put('/user/profile', { profile: data }),
  updateProfilePicture: (profile_picture_url: string) =>
    api.post('/user/update-profile-picture', new URLSearchParams({ profile_picture_url }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

// Notes API
export const notesAPI = {
  getNotes: (params?: { year?: number; semester?: number; specialization?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/notes', { params }),
  getNote: (id: string) => api.get(`/notes/${id}`),
  viewNote: (id: string) => api.get(`/notes/view/${id}`, { responseType: 'blob' }),
  getMyUploads: (params?: { page?: number; limit?: number }) => api.get('/notes/my-uploads', { params }),
  uploadNote: (data: {
    course_title: string;
    course_code: string;
    year_of_study: number;
    semester_of_study: number;
    specialization?: string;
    file_url: string;
    thumbnail_url?: string;
    description?: string;
  }) => api.post('/notes/upload', data),
  deleteNote: (id: string) => api.delete(`/notes/${id}`),
};

// Past Papers API
export const pastPapersAPI = {
  getPastPapers: (params?: { year?: number; semester?: number; specialization?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/past-papers', { params }),
  getPastPaper: (id: string) => api.get(`/past-papers/${id}`),
  viewPastPaper: (id: string) => api.get(`/past-papers/view/${id}`, { responseType: 'blob' }),
  getMyPapers: (params?: { page?: number; limit?: number }) => api.get('/past-papers/my-uploads', { params }),
  uploadPaper: (data: {
    course_title: string;
    course_code: string;
    year_of_study: number;
    semester_of_study: number;
    specialization?: string;
    file_url: string;
    thumbnail_url?: string;
    description?: string;
  }) => api.post('/past-papers/upload', data),
  deletePaper: (id: string) => api.delete(`/past-papers/${id}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => 
    api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
  getPendingNotes: (params?: { page?: number; limit?: number }) => 
    api.get('/admin/notes/pending', { params }),
  updateNoteStatus: (id: string, data: { status: string; feedback?: string }) =>
    api.put(`/admin/notes/${id}`, data),
  updateNote: (id: string, data: any) => api.put(`/admin/notes/${id}/edit`, data),
  
  getPendingPapers: (params?: { page?: number; limit?: number }) => 
    api.get('/admin/past-papers/pending', { params }),
  updatePaperStatus: (id: string, data: { status: string; feedback?: string }) =>
    api.put(`/admin/past-papers/${id}`, data),
  updatePaper: (id: string, data: any) => api.put(`/admin/past-papers/${id}/edit`, data),
    
  createBlog: (data: { title: string; content: string; thumbnail_url?: string }) =>
    api.post('/admin/blogs', data),
  updateBlog: (id: string, data: { title: string; content: string; thumbnail_url?: string }) =>
    api.put(`/admin/blogs/${id}`, data),
  deleteBlog: (id: string) => api.delete(`/admin/blogs/${id}`),
  
  // New endpoints for managing all notes and papers
  getAllNotes: (params?: { page?: number; limit?: number; search?: string }) => 
    api.get('/notes', { params }),
  getAllPapers: (params?: { page?: number; limit?: number; search?: string }) => 
    api.get('/past-papers', { params }),
  deleteNote: (id: string) => api.delete(`/notes/${id}`),
  deletePaper: (id: string) => api.delete(`/past-papers/${id}`),
};

// Blog API
export const blogAPI = {
  getBlogs: (params?: { page?: number; limit?: number; search?: string }) => 
    api.get('/blogs', { params }),
  getBlog: (id: string) => api.get(`/blogs/${id}`),
};

// Profile API updates
export const profileAPI = {
  updateProfilePicture: (profile_picture_url: string) =>
    api.post('/user/update-profile-picture', new URLSearchParams({ profile_picture_url }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/user/change-password', data),
  deleteAccount: (data: { email: string; code: string }) =>
    api.post('/auth/confirm-account-deletion', data),
};

export default api;
