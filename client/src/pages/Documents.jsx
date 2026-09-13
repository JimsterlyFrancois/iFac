import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';  
import api from '../api/axios';  
import SortBar from '../components/SortBar';
  
export default function Documents() {  
  const [search, setSearch] = useState('');  
  const [query, setQuery] = useState('');  
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  
  const { data, isLoading, isError } = useQuery({  
    queryKey: ['documents', query],  
    queryFn: async () => {  
      const res = await api.get('/documents', { params: { search: query } });  
      return res.data;  
    },  
  });  
  
  const documents = data?.data || [];  
  const filteredDocuments = useMemo(
    () => documents.filter((document) =>
      (!category || document.category === category) &&
      (!level || document.target_level === level || document.target_level === 'ALL')
    ),
    [category, documents, level]
  );

  const openDocument = async (document) => {
    const windowRef = window.open('', '_blank');
    try {
      await api.post(`/documents/${document.id}/download`);
      windowRef.location.href = document.file_url;
    } catch {
      windowRef.close();
    }
  };
  
  return (  
    <div className="mt-6">  
      <h1 className="text-xl font-bold mb-4">Mes documents</h1>  
  
      <form  
        onSubmit={(e) => { e.preventDefault(); setQuery(search); }}  
        className="flex gap-2 mb-4"  
      >  
        <input  
          type="text" placeholder="Rechercher un document..."  
          value={search} onChange={(e) => setSearch(e.target.value)}  
          className="flex-1 border p-2 rounded"  
        />  
        <button className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">  
          Rechercher  
        </button>  
      </form>  
  
      {isLoading && <p>Chargement...</p>}  
      {isError && <p className="text-red-600">Erreur lors du chargement des documents.</p>}  
      {!isLoading && documents.length > 0 && <SortBar category={category} level={level} onCategoryChange={setCategory} onLevelChange={setLevel} />}
      {!isLoading && filteredDocuments.length === 0 && <p>Aucun document trouvé.</p>}
  
      <div className="space-y-3">  
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white p-4 rounded shadow">  
            <h2 className="font-semibold">{doc.title}</h2>  
            <p className="text-sm text-gray-600">{doc.description}</p>  
            <p className="text-xs text-gray-400 mt-1">  
              {doc.category} — {doc.target_level}  
            </p>  
            <button type="button" onClick={() => openDocument(doc)} className="mt-3 rounded bg-ifac-primary px-3 py-2 text-sm font-semibold text-white hover:bg-ifac-primary-dark">
              Ouvrir / Lire
            </button>
          </div>  
        ))}  
      </div>  
    </div>  
  );  
}