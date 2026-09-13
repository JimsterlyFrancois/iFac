import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center py-12">
      <div className="max-w-xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-ifac-secondary">
          Plateforme universitaire
        </p>
        <h1 className="text-7xl font-black tracking-tight text-ifac-primary">iFac</h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-slate-600">
          Retrouvez les ressources pédagogiques de votre faculté au même endroit.
          <br />
          Consultez vos cours, TD et examens en quelques clics.
        </p>
        <div className="mt-9 flex justify-center gap-3">
          <Link to="/login" className="rounded-lg bg-ifac-primary px-5 py-3 font-semibold text-white transition hover:bg-ifac-primary-dark">
            Connexion
          </Link>
          <Link to="/register" className="rounded-lg border border-ifac-primary px-5 py-3 font-semibold text-ifac-primary transition hover:bg-ifac-primary/10">
            Inscription
          </Link>
        </div>
      </div>
    </main>
  );
}