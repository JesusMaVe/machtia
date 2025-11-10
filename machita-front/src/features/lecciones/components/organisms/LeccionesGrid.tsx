import type { Leccion, LeccionesPorNivel } from "../../types";
import { LeccionCard } from "../molecules/LeccionCard";
import { DIFICULTADES } from "@/shared/constants";
import { Circle } from "lucide-react";
import { useMemo } from "react";

interface LeccionesGridProps {
  lecciones: Leccion[];
}

export function LeccionesGrid({ lecciones }: LeccionesGridProps) {
  const leccionesPorNivel = useMemo<LeccionesPorNivel>(() => {
    if (!Array.isArray(lecciones)) {
      return {
        principiante: [],
        intermedio: [],
        avanzado: [],
      };
    }

    return lecciones.reduce(
      (acc, leccion) => {
        acc[leccion.dificultad].push(leccion);
        return acc;
      },
      {
        principiante: [],
        intermedio: [],
        avanzado: [],
      } as LeccionesPorNivel
    );
  }, [lecciones]);

  const renderNivel = (
    titulo: string,
    IconComponent: React.ReactNode,
    lecciones: Leccion[],
    colorClass: string
  ) => {
    if (lecciones.length === 0) return null;

    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {IconComponent}
          <h2 className={`text-xl font-bold ${colorClass}`}>NIVEL: {titulo.toUpperCase()}</h2>
          <span className="text-sm text-muted-foreground">({lecciones.length} lecciones)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {lecciones.map((leccion) => (
            <LeccionCard key={leccion.id} leccion={leccion} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8">
      {renderNivel(
        "Principiante",
        <Circle className="h-6 w-6 text-green-600 dark:text-green-400" fill="currentColor" />,
        leccionesPorNivel.principiante,
        "text-green-600 dark:text-green-400"
      )}
      {renderNivel(
        "Intermedio",
        <Circle className="h-6 w-6 text-amber-500 dark:text-amber-400" fill="currentColor" />,
        leccionesPorNivel.intermedio,
        "text-amber-600 dark:text-amber-400"
      )}
      {renderNivel(
        "Avanzado",
        <Circle className="h-6 w-6 text-red-600 dark:text-red-400" fill="currentColor" />,
        leccionesPorNivel.avanzado,
        "text-red-600 dark:text-red-400"
      )}

      {(!Array.isArray(lecciones) || lecciones.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No hay lecciones disponibles en este momento.
          </p>
        </div>
      )}
    </div>
  );
}
