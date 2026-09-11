import { useState } from 'react';  
import { useNavigate, Link } from 'react-router-dom';  
import api from '../api/axios';  
import { useAuthStore } from '../store/auth';  

const academicMatrix = {
  FSE: [
    'Psychopédagogie',
    'Administration Scolaire',
    'Mathématiques et Physique',
    'Histoire et Géographie',
  ],
  'ESSAP/MT/TS': ['Santé Publique', 'Médecine Tropicale', 'Travail Social'],
  ESUTH: ['Gestion Touristique', 'Hôtellerie et Restauration'],
  FDSPRI: ['Sciences Juridiques', 'Science Politique', 'Relations Internationales'],
};
  
export default function Register() {  
  const [form, setForm] = useState({  
    email: '', password: '',  
    faculty: 'FSE',
    option: 'Psychopédagogie',  
    level: 'L1',  
  });  
  const [error, setError] = useState('');  
  const [loading, setLoading] = useState(false);  
  const login = useAuthStore((s) => s.login);  
  const navigate = useNavigate();  
  
  const update = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'faculty' ? { option: academicMatrix[value][0] } : {}),
    }));
  };
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    setError('');  
    setLoading(true);  
    try {  
      const { data } = await api.post('/auth/register', form);  
      login(data.token, data.user);  
      navigate('/documents');  
    } catch (err) {  
      setError(err.response?.data?.error || 'Erreur lors de l’inscription');  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  return (  
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">  
      <h1 className="text-xl font-bold mb-4">Inscription</h1>  
      {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</p>}  
      <form onSubmit={handleSubmit} className="space-y-3">  
        <input  
          type="email" name="email" placeholder="Email" value={form.email}  
          onChange={update} required className="w-full border p-2 rounded"  
        />  
        <input  
          type="password" name="password" placeholder="Mot de passe" value={form.password}  
          onChange={update} required className="w-full border p-2 rounded"  
        />  
        <select name="faculty" value={form.faculty} onChange={update} required className="w-full border p-2 rounded">
          {Object.keys(academicMatrix).map((faculty) => (
            <option key={faculty} value={faculty}>{faculty}</option>
          ))}
        </select>
        <select name="option" value={form.option} onChange={update} required className="w-full border p-2 rounded">
          {academicMatrix[form.faculty].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select  
          name="level" value={form.level} onChange={update}  
          className="w-full border p-2 rounded"  
        >  
          <option value="L1">L1</option>  
          <option value="L2">L2</option>  
          <option value="L3">L3</option>  
          <option value="L4">L4</option>  
        </select>  
        <button  
          type="submit" disabled={loading}  
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"  
        >  
          {loading ? 'Création...' : 'Créer mon compte'}  
        </button>  
      </form>  
      <p className="text-sm mt-3">  
        Déjà un compte ? <Link to="/login" className="text-blue-600">Connexion</Link>  
      </p>  
    </div>  
  );  
}