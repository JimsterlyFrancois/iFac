import { Routes, Route, Navigate } from 'react-router-dom';  
import Navbar from './components/Navbar';  
import ProtectedRoute from './components/ProtectedRoute';  
import Login from './pages/Login';  
import Register from './pages/Register';  
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';  
import Downloads from './pages/Downloads';
import Upload from './pages/Upload';  
  
export default function App() {  
  return (  
    <div className="min-h-screen">  
      <Navbar />  
      <div className="max-w-4xl mx-auto p-4">  
        <Routes>  
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />  
          <Route path="/register" element={<Register />} />  
          <Route  
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"  
            element={  
              <ProtectedRoute>  
                <Documents />  
              </ProtectedRoute>  
            }  
          />  
          <Route
            path="/downloads"
            element={
              <ProtectedRoute>
                <Downloads />
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