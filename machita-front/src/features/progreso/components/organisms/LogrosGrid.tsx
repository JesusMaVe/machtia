import type { Logro } from "../../types";
import { LogroCard } from "../molecules/LogroCard";

interface LogrosGridProps {
  logros: Logro[];
}

export function LogrosGrid({ logros }: LogrosGridProps) {
  const desbloqueados = logros.filter((l) => l.desbloqueado).length;
  const total = logros.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-obsidiana dark:text-white">Logros</h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold text-jade dark:text-purple-400">{desbloqueados}</span>
          <span> de </span>
          <span className="font-semibold">{total}</span>
          <span> desbloqueados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {logros.map((logro) => (
          <LogroCard key={logro.id} logro={logro} />
        ))}
      </div>

      {logros.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No hay logros disponibles.</p>
        </div>
      )}
    </div>
  );
}
