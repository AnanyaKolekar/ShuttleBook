import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://shuttlebook.onrender.com/api',
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Auth
export const signup = (payload) => api.post('/auth/signup', payload).then((r) => r.data);
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const me = () => api.get('/auth/me').then((r) => r.data);

// Public/meta
export const fetchMeta = () => api.get('/meta').then((r) => r.data);
export const fetchAvailability = (date, courtId) =>
  api.get('/bookings/availability', { params: { date, courtId } }).then((r) => r.data);

// Booking (auth)
export const fetchPrice = (payload) => api.post('/bookings/price', payload).then((r) => r.data);
export const createBooking = (payload) => api.post('/bookings', payload).then((r) => r.data);
export const fetchHistory = () => api.get('/bookings/history').then((r) => r.data);
export const joinWaitlist = (payload) => api.post('/bookings/waitlist', payload).then((r) => r.data);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);

// Admin
export const admin = {
  listCourts: () => api.get('/admin/courts').then((r) => r.data),
  saveCourt: (payload) => api.post('/admin/courts', payload).then((r) => r.data),
  updateCourt: (id, payload) => api.patch(`/admin/courts/${id}`, payload).then((r) => r.data),
  listEquipment: () => api.get('/admin/equipment').then((r) => r.data),
  saveEquipment: (payload) => api.post('/admin/equipment', payload).then((r) => r.data),
  updateEquipment: (id, payload) => api.patch(`/admin/equipment/${id}`, payload).then((r) => r.data),
  listCoaches: () => api.get('/admin/coaches').then((r) => r.data),
  saveCoach: (payload) => api.post('/admin/coaches', payload).then((r) => r.data),
  updateCoach: (id, payload) => api.patch(`/admin/coaches/${id}`, payload).then((r) => r.data),
  listPricingRules: () => api.get('/admin/pricing-rules').then((r) => r.data),
  savePricingRule: (payload) => api.post('/admin/pricing-rules', payload).then((r) => r.data),
  updatePricingRule: (id, payload) => api.patch(`/admin/pricing-rules/${id}`, payload).then((r) => r.data),
};

export default api;

