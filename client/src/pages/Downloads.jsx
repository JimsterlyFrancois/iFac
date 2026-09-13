import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export default function Downloads() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['downloads'],
    queryFn: async () => (await api.get('/documents/downloads')).data,
  });

  const documents = data?.data || [];

  const openDocument = async (document) => {
    await api.post(`/documents/${document.id}/download`);
    window.open(document.file_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="py-8">
      <h1 className="text-3xl font-bold text-ifac-ink">Documents téléchargés</h1>
      <p className="mt-2 text-slate-600">Les ressources que vous avez déjà consultées.</p>
      {isLoading && <p className="mt-8 text-slate-600">Chargement...</p>}
      {isError && <p className="mt-8 text-red-600">Erreur lors du chargement des téléchargements.</p>}
      {!isLoading && !isError && documents.length === 0 && <p className="mt-8 text-slate-600">Aucun document téléchargé.</p>}
      <div className="mt-8 grid gap-4">
        {documents.map((document) => (
          <article key={`${document.id}-${document.downloaded_at || ''}`} className="rounded-xl border border-ifac-border bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold text-ifac-ink">{document.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{document.category} · {document.target_level}</p>
              </div>
              <button type="button" onClick={() => openDocument(document)} className="rounded-lg bg-ifac-primary px-4 py-2 text-sm font-semibold text-white hover:bg-ifac-primary-dark">
                Cliquer pour lire
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}