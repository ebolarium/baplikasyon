import axios from 'axios';

// Set auth token in axios default headers
export const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Get user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    return null;
  }
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Register the auth token handler on page load
export const initializeAuth = () => {
  const token = getToken();
  if (token) {
    setAuthToken(token);
  }
};

// Login the user and set localStorage items
export const loginUser = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  setAuthToken(token);
  return user;
};

// Logout the user and clear localStorage
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setAuthToken(null);
};

// Get the user's email or return a default if not available
export const getUserEmail = () => {
  const user = getCurrentUser();
  return user?.email || 'baris@odakkimya.com.tr'; // Fallback to default email
}; 