import { Link, useNavigate } from 'react-router-dom';  
import { useAuthStore } from '../store/auth';  
  
export default function Navbar() {  
  const { token, user, logout } = useAuthStore();  
  const navigate = useNavigate();  
  
  const handleLogout = () => {  
    logout();  
    navigate('/login');  
  };  
  
  return (  
    <nav className="bg-gray-800 text-white px-4 py-3">  
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">  
        <Link to="/" className="font-bold text-lg">iFac+</Link>  
        <div className="flex flex-wrap items-center gap-3 text-sm">  
          {token ? (  
            <>  
              <Link to="/documents" className="hover:underline">Documents</Link>  
              {user?.is_admin && (  
                <Link to="/upload" className="hover:underline">Ajouter</Link>  
              )}  
              <span className="opacity-80">{user?.email}</span>  
              <button  
                onClick={handleLogout}  
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"  
              >  
                Déconnexion  
              </button>  
            </>  
          ) : (  
            <>  
              <Link to="/login" className="hover:underline">Connexion</Link>  
              <Link to="/register" className="hover:underline">Inscription</Link>  
            </>  
          )}  
        </div>  
      </div>  
    </nav>  
  );  
}