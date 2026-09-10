import { useState } from 'react';  
import { useNavigate } from 'react-router-dom';  
import api from '../api/axios';  
  
export default function Upload() {  
  const [form, setForm] = useState({  
    title: '', description: '',  
    target_faculty: "Faculté des Sciences de l'Éducation",  
    target_option: 'Psychopédagogie',  
    target_level: 'ALL',  
    category: 'Cours',  
  });  
  const [file, setFile] = useState(null);  
  const [error, setError] = useState('');  
  const [success, setSuccess] = useState('');  
  const [loading, setLoading] = useState(false);  
  const navigate = useNavigate();  
  
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    setError('');  
    setSuccess('');  
    if (!file) { setError('Veuillez choisir un fichier'); return; }  
    setLoading(true);  
    try {  
      const fd = new FormData();  
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));  
      fd.append('file', file);  
      await api.post('/documents', fd, {  
        headers: { 'Content-Type': 'multipart/form-data' },  
      });  
      setSuccess('Document ajouté avec succès !');  
      setTimeout(() => navigate('/documents'), 1000);  
    } catch (err) {  
      setError(err.response?.data?.error || 'Erreur lors de l’ajout');  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  return (  
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">  
      <h1 className="text-xl font-bold mb-4">Ajouter un document</h1>  
      {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</p>}  
      {success && <p className="bg-green-100 text-green-700 p-2 rounded mb-3">{success}</p>}  
      <form onSubmit={handleSubmit} className="space-y-3">  
        <input  
          type="text" name="title" placeholder="Titre" value={form.title}  
          onChange={update} required className="w-full border p-2 rounded"  
        />  
        <textarea  
          name="description" placeholder="Description" value={form.description}  
          onChange={update} className="w-full border p-2 rounded"  
        />  
        <input  
          type="text" name="target_faculty" placeholder="Faculté cible" value={form.target_faculty}  
          onChange={update} required className="w-full border p-2 rounded"  
        />  
        <input  
          type="text" name="target_option" placeholder="Option cible" value={form.target_option}  
          onChange={update} required className="w-full border p-2 rounded"  
        />  
        <select  
          name="target_level" value={form.target_level} onChange={update}  
          className="w-full border p-2 rounded"  
        >  
          <option value="ALL">Tous les niveaux</option>  
          <option value="L1">L1</option>  
          <option value="L2">L2</option>  
          <option value="L3">L3</option>  
          <option value="L4">L4</option>  
        </select>  
        <input  
          type="text" name="category" placeholder="Catégorie" value={form.category}  
          onChange={update} required className="w-full border p-2 rounded"  
        />  
        <input  
          type="file" accept=".pdf,.doc,.docx"  
          onChange={(e) => setFile(e.target.files[0])} required  
          className="w-full border p-2 rounded"  
        />  
        <button  
          type="submit" disabled={loading}  
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"  
        >  
          {loading ? 'Envoi...' : 'Ajouter le document'}  
        </button>  
      </form>  
    </div>  
  );  
}