import { useState } from 'react';  
import { useNavigate, Link } from 'react-router-dom';  
import api from '../api/axios';  
import { useAuthStore } from '../store/auth';  
  
export default function Login() {  
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');  
  const [error, setError] = useState('');  
  const [loading, setLoading] = useState(false);  
  const login = useAuthStore((s) => s.login);  
  const navigate = useNavigate();  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    setError('');  
    setLoading(true);  
    try {  
      const { data } = await api.post('/auth/login', { email, password });  
      login(data.token, data.user);  
      navigate('/documents');  
    } catch (err) {  
      setError(err.response?.data?.error || 'Erreur de connexion');  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  return (  
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">  
      <h1 className="text-xl font-bold mb-4">Connexion</h1>  
      {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</p>}  
      <form onSubmit={handleSubmit} className="space-y-3">  
        <input  
          type="email" placeholder="Email" value={email}  
          onChange={(e) => setEmail(e.target.value)} required  
          className="w-full border p-2 rounded"  
        />  
        <input  
          type="password" placeholder="Mot de passe" value={password}  
          onChange={(e) => setPassword(e.target.value)} required  
          className="w-full border p-2 rounded"  
        />  
        <button  
          type="submit" disabled={loading}  
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"  
        >  
          {loading ? 'Connexion...' : 'Se connecter'}  
        </button>  
      </form>  
      <p className="text-sm mt-3">  
        Pas de compte ? <Link to="/register" className="text-blue-600">Inscription</Link>  
      </p>  
    </div>  
  );  
}