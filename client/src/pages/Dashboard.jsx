import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-ifac-secondary">Espace étudiant</p>
        <h1 className="mt-2 text-3xl font-bold text-ifac-ink">Bonjour, bienvenue sur iFac</h1>
      </div>

      <section className="rounded-2xl bg-ifac-primary p-6 text-white shadow-lg">
        <p className="text-sm text-ifac-mist">Votre profil</p>
        <h2 className="mt-1 text-xl font-semibold">{user?.email}</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div><dt className="text-xs uppercase text-ifac-mist">Faculté</dt><dd className="mt-1 font-medium">{user?.faculty || 'Non renseignée'}</dd></div>
          <div><dt className="text-xs uppercase text-ifac-mist">Option</dt><dd className="mt-1 font-medium">{user?.option || 'Non renseignée'}</dd></div>
          <div><dt className="text-xs uppercase text-ifac-mist">Niveau</dt><dd className="mt-1 font-medium">{user?.level || 'Non renseigné'}</dd></div>
        </dl>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/documents" className="group rounded-xl border border-ifac-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-ifac-secondary">
          <span className="text-3xl">▦</span>
          <h2 className="mt-4 text-lg font-semibold text-ifac-ink">Tous les documents</h2>
          <p className="mt-2 text-sm text-slate-600">Accédez aux ressources adaptées à votre faculté, option et niveau.</p>
        </Link>
        <Link to="/downloads" className="group rounded-xl border border-ifac-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-ifac-secondary">
          <span className="text-3xl">↓</span>
          <h2 className="mt-4 text-lg font-semibold text-ifac-ink">Téléchargements</h2>
          <p className="mt-2 text-sm text-slate-600">Retrouvez les documents que vous avez déjà ouverts.</p>
        </Link>
      </section>
    </main>
  );
}