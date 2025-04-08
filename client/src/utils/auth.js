import axios from 'axios';

// Get the JWT token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get the current user information from localStorage or decode from JWT
export const getCurrentUser = () => {
  // Try to get user from localStorage first
  const user = localStorage.getItem('user');
  if (user) {
    return JSON.parse(user);
  }
  
  // If no user in localStorage, check for token
  const token = getToken();
  if (!token) return null;
  
  try {
    // Simple parsing of JWT payload (middle part)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Get the user's email or return a default if not available
export const getUserEmail = () => {
  const user = getCurrentUser();
  return user?.email || 'baris@odakkimya.com.tr'; // Fallback to default email
}; 