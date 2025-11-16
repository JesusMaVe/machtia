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

  const renderNivel = (titulo: string, lecciones: Leccion[]) => {
    if (lecciones.length === 0) return null;

    return (
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <Circle className="h-5 w-5 text-[#d4a574] dark:text-orange-500" fill="currentColor" />
          <h2 className="text-xl font-bold text-obsidiana dark:text-white">NIVEL: {titulo.toUpperCase()}</h2>
          <span className="text-sm text-muted-foreground dark:text-gray-400">({lecciones.length} lecciones)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lecciones.map((leccion) => (
            <LeccionCard key={leccion.id} leccion={leccion} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8">
      {renderNivel("Principiante", leccionesPorNivel.principiante)}
      {renderNivel("Intermedio", leccionesPorNivel.intermedio)}
      {renderNivel("Avanzado", leccionesPorNivel.avanzado)}

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
