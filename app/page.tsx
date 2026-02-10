import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-bold text-white md:text-4xl">
        Bienvenue sur <span className="text-[#1A10AC]">BK Copilot</span>
      </h1>
      <p className="max-w-md text-center text-gray-400 text-lg">
        Gérez votre dashboard, clients, finance et objectifs en un seul endroit.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-[#1A10AC] px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Accéder au Dashboard
      </Link>
    </div>
  );
}
