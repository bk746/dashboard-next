import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 bg-[#f8f8f7] dark:bg-[#0a0a0c]">
      <div className="mx-auto w-full max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500">Bienvenue</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl md:text-5xl">
          <span className="text-[#ED8600] dark:text-[#8fa9c9]">BK Copilot</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Gérez votre dashboard, clients, finance et objectifs en un seul endroit.
        </p>
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-[#ED8600] px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-[#ED8600]/25 transition hover:bg-[#d97706] focus:outline-none focus:ring-2 focus:ring-[#ED8600] focus:ring-offset-2 dark:bg-[#5b7fb8] dark:shadow-[#5b7fb8]/25 dark:hover:bg-[#4e6fa3] dark:focus:ring-[#8fa9c9] dark:focus:ring-offset-[#0a0a0c]"
          >
            Accéder au Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
