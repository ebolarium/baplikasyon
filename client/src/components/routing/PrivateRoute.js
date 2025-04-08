import React from 'react';
import { Navigate } from 'react-router-dom';

// Always allow access to private routes
const PrivateRoute = ({ children }) => {
  // Always render children, no authentication check needed
  return children;
};

export default PrivateRoute; 