import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/features/auth";
import { useSearchParams } from "react-router";
import { leccionesApi, LeccionesGrid, type Leccion, type Tema } from "@/features/lecciones";
import { LeccionesFilter } from "@/features/lecciones/components/molecules/LeccionesFilter";
import { PageHeader } from "@/shared/components/molecules";
import { LoadingButton } from "@/shared/components/atoms";
import type { Dificultad } from "@/shared/constants";

export function meta() {
  return [
    { title: "Lecciones de Náhuatl - Machtia" },
    { name: "description", content: "Explora todas las lecciones disponibles de Náhuatl" },
  ];
}

export default function LeccionesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [todasLecciones, setTodasLecciones] = useState<Leccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leer dificultad desde query params o usar "todas"
  const dificultadFromURL = searchParams.get("dificultad") as Dificultad | null;
  const [dificultadFiltro, setDificultadFiltro] = useState<Dificultad | "todas">(
    dificultadFromURL || "todas"
  );
  const [temaFiltro, setTemaFiltro] = useState<Tema | "todos">("todos");

  // Actualizar filtro si cambia el query param
  useEffect(() => {
    if (dificultadFromURL && dificultadFromURL !== dificultadFiltro) {
      setDificultadFiltro(dificultadFromURL);
    }
  }, [dificultadFromURL]);

  // Cargar todas las lecciones UNA SOLA VEZ
  useEffect(() => {
    const cargarTodasLecciones = async () => {
      try {
        setIsLoading(true);
        const data = await leccionesApi.list();
        setTodasLecciones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar lecciones");
      } finally {
        setIsLoading(false);
      }
    };

    cargarTodasLecciones();
  }, []);

  // Filtrar lecciones LOCALMENTE (sin llamadas al backend)
  const leccionesFiltradas = useMemo(() => {
    return todasLecciones.filter((leccion) => {
      const cumpleDificultad =
        dificultadFiltro === "todas" || leccion.dificultad === dificultadFiltro;
      const cumpleTema = temaFiltro === "todos" || leccion.tema === temaFiltro;
      return cumpleDificultad && cumpleTema;
    });
  }, [todasLecciones, dificultadFiltro, temaFiltro]);

  // Temas disponibles calculados de todas las lecciones
  const temasDisponibles = useMemo(() => {
    const temas = new Set<string>();
    todasLecciones.forEach((leccion) => {
      if (leccion.tema) {
        temas.add(leccion.tema);
      }
    });
    return Array.from(temas).sort();
  }, [todasLecciones]);

  const limpiarFiltros = () => {
    setDificultadFiltro("todas");
    setTemaFiltro("todos");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <PageHeader
            title="Catálogo de Lecciones"
            description="Explora todas las lecciones disponibles y filtra por dificultad o tema"
          />

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span>
              Lecciones completadas:{" "}
              <span className="font-semibold text-[#76b57b] dark:text-purple-400">
                {user.leccionesCompletadas.length}
              </span>
            </span>
            <span className="text-gray-400">•</span>
            <span>
              Total de lecciones:{" "}
              <span className="font-semibold text-obsidiana dark:text-white">
                {todasLecciones.length}
              </span>
            </span>
          </div>
        </div>

        <div className="mb-6">
          <LeccionesFilter
            dificultad={dificultadFiltro}
            tema={temaFiltro}
            temasDisponibles={temasDisponibles}
            onDificultadChange={setDificultadFiltro}
            onTemaChange={setTemaFiltro}
            onLimpiar={limpiarFiltros}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingButton isLoading={true} disabled>
              Cargando lecciones...
            </LoadingButton>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-sm text-red-700 dark:text-red-300 underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        ) : (
          <>
            {leccionesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    No se encontraron lecciones con los filtros seleccionados
                  </p>
                  <button
                    onClick={limpiarFiltros}
                    className="mt-4 text-sm text-blue-700 dark:text-blue-300 underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            ) : (
              <LeccionesGrid lecciones={leccionesFiltradas} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
