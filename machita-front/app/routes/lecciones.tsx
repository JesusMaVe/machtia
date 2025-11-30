import { useMemo } from "react";
import { useAuth } from "@/features/auth";
import { useSearchParams, useLoaderData } from "react-router";
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

export async function clientLoader() {
  try {
    const lecciones = await leccionesApi.list();
    return { lecciones };
  } catch (error) {
    throw new Response("Error al cargar lecciones", { status: 500 });
  }
}

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-cream dark:bg-[#0a0a0a] flex items-center justify-center">
      <LoadingButton isLoading={true} disabled>
        Cargando lecciones...
      </LoadingButton>
    </div>
  );
}

export default function LeccionesPage() {
  const { user } = useAuth();
  const { lecciones: todasLecciones } = useLoaderData<typeof clientLoader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer dificultad desde query params o usar "todas"
  const dificultadFromURL = searchParams.get("dificultad") as Dificultad | null;
  const dificultadFiltro = (dificultadFromURL || "todas") as Dificultad | "todas";
  const temaFiltro = (searchParams.get("tema") || "todos") as Tema | "todos";

  const setDificultadFiltro = (dificultad: Dificultad | "todas") => {
    const newParams = new URLSearchParams(searchParams);
    if (dificultad === "todas") {
      newParams.delete("dificultad");
    } else {
      newParams.set("dificultad", dificultad);
    }
    setSearchParams(newParams, { replace: true });
  };

  const setTemaFiltro = (tema: Tema | "todos") => {
    const newParams = new URLSearchParams(searchParams);
    if (tema === "todos") {
      newParams.delete("tema");
    } else {
      newParams.set("tema", tema);
    }
    setSearchParams(newParams, { replace: true });
  };

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
    setSearchParams(new URLSearchParams(), { replace: true });
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
      </div>
    </div>
  );
}
