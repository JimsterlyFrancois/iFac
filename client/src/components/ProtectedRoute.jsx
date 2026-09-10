import { Navigate } from 'react-router-dom';  
import { useAuthStore } from '../store/auth';  
  
export default function ProtectedRoute({ children, adminOnly = false }) {  
  const { token, user } = useAuthStore();  
  
  if (!token) return <Navigate to="/login" replace />;  
  if (adminOnly && !user?.is_admin) return <Navigate to="/documents" replace />;  
  
  return children;  
}