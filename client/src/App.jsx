import { Routes, Route, Navigate } from 'react-router-dom';  
import { useAuthStore } from './store/auth';  
import Navbar from './components/Navbar';  
import ProtectedRoute from './components/ProtectedRoute';  
import Login from './pages/Login';  
import Register from './pages/Register';  
import Documents from './pages/Documents';  
import Upload from './pages/Upload';  
  
export default function App() {  
  const token = useAuthStore((s) => s.token);  
  
  return (  
    <div className="min-h-screen">  
      <Navbar />  
      <div className="max-w-4xl mx-auto p-4">  
        <Routes>  
          <Route  
            path="/"  
            element={<Navigate to={token ? '/documents' : '/login'} replace />}  
          />  
          <Route path="/login" element={<Login />} />  
          <Route path="/register" element={<Register />} />  
          <Route  
            path="/documents"  
            element={  
              <ProtectedRoute>  
                <Documents />  
              </ProtectedRoute>  
            }  
          />  
          <Route  
            path="/upload"  
            element={  
              <ProtectedRoute adminOnly>  
                <Upload />  
              </ProtectedRoute>  
            }  
          />  
          <Route path="*" element={<Navigate to="/" replace />} />  
        </Routes>  
      </div>  
    </div>  
  );  
}