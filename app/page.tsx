import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
          Bienvenue
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          <span className="text-orange-500">BK Copilot</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-gray-500 sm:text-lg">
          Gérez votre dashboard, clients, finance et objectifs en un seul endroit.
        </p>
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Accéder au Dashboard
          </Link>
        </div>
        <p className="mt-8 text-xs text-gray-400">Dernière mise à jour : 2 mars 2026</p>
      </div>
    </div>
  );
}
