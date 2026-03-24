const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const fetchApi = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }
  
  return response.json()
}

// Restaurant API
export const restaurantApi = {
  getAll: () => fetchApi('/restaurants'),
  getById: (id) => fetchApi(`/restaurants/${id}`),
  create: (data) => fetchApi('/restaurants', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/restaurants/${id}`, { method: 'DELETE' }),
}

// Reservation API
export const reservationApi = {
  getAll: () => fetchApi('/reservations'),
  getById: (id) => fetchApi(`/reservations/${id}`),
  create: (data) => fetchApi('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/reservations/${id}`, { method: 'DELETE' }),
  updateStatus: (id, status) => fetchApi(`/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

// Table API
export const tableApi = {
  getAll: () => fetchApi('/tables'),
  getById: (id) => fetchApi(`/tables/${id}`),
  create: (data) => fetchApi('/tables', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/tables/${id}`, { method: 'DELETE' }),
}

// Menu API
export const menuApi = {
  getAll: () => fetchApi('/menus'),
  getById: (id) => fetchApi(`/menus/${id}`),
  create: (data) => fetchApi('/menus', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/menus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/menus/${id}`, { method: 'DELETE' }),
}

// Invoice API
export const invoiceApi = {
  getAll: () => fetchApi('/invoices'),
  getById: (id) => fetchApi(`/invoices/${id}`),
  create: (data) => fetchApi('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/invoices/${id}`, { method: 'DELETE' }),
}

// Employee API
export const employeeApi = {
  getAll: () => fetchApi('/employees'),
  getById: (id) => fetchApi(`/employees/${id}`),
  create: (data) => fetchApi('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/employees/${id}`, { method: 'DELETE' }),
}

// Auth API
export const authApi = {
  login: (data) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => fetchApi('/auth/me'),
}