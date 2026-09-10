import axios from 'axios';  
import { useAuthStore } from '../store/auth';  
  
const api = axios.create({  
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',  
});  
  
// Ajoute le token JWT à chaque requête  
api.interceptors.request.use((config) => {  
  const token = useAuthStore.getState().token;  
  if (token) {  
    config.headers.Authorization = `Bearer ${token}`;  
  }  
  return config;  
});  
  
// Déconnecte automatiquement si le token est invalide/expiré  
api.interceptors.response.use(  
  (res) => res,  
  (error) => {  
    if (error.response && error.response.status === 401) {  
      useAuthStore.getState().logout();  
    }  
    return Promise.reject(error);  
  }  
);  
  
export default api;