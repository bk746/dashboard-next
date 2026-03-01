import { FaBullseye } from "react-icons/fa";

interface ObjectifAnnuelCardProps {
  caActuel: number;
  objectif: number;
  progression: number;
}

export default function ObjectifAnnuelCard({ caActuel, objectif, progression }: ObjectifAnnuelCardProps) {
  const percentage = Math.min(progression, 100);
  const isCompleted = progression >= 100;

  return (
    <div className="h-full rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">Objectif annuel</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 tabular-nums">
            {objectif > 0 ? caActuel.toLocaleString("fr-FR") : 0} €
          </p>
          <p className="mt-1 text-xs text-gray-400">
            sur {objectif > 0 ? objectif.toLocaleString("fr-FR") : 0} €
          </p>
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? "bg-emerald-500" : "bg-orange-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {isCompleted && (
              <p className="mt-1.5 text-xs font-medium text-emerald-600">Objectif atteint</p>
            )}
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
          <FaBullseye className="h-5 w-5 text-orange-500" />
        </div>
      </div>
    </div>
  );
}
