import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../App';

// Component for protecting routes that require authentication
const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute; 