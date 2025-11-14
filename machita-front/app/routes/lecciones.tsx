import { useEffect, useState, useMemo } from "react";
import { ProtectedRoute, useAuth } from "@/features/auth";
import { leccionesApi, LeccionesGrid, type Leccion, type Tema } from "@/features/lecciones";
import { LeccionesFilter } from "@/features/lecciones/components/molecules/LeccionesFilter";
import { PageHeader } from "@/shared/components/molecules";
import { LoadingButton } from "@/shared/components/atoms";
import { Coins, Heart } from "lucide-react";
import type { Dificultad } from "@/shared/constants";

export default function LeccionesPage() {
  const { user } = useAuth();
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [todasLecciones, setTodasLecciones] = useState<Leccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dificultadFiltro, setDificultadFiltro] = useState<Dificultad | "todas">("todas");
  const [temaFiltro, setTemaFiltro] = useState<Tema | "todos">("todos");

  const temasDisponibles = useMemo(() => {
    const temas = new Set<string>();
    todasLecciones.forEach((leccion) => {
      if (leccion.tema) {
        temas.add(leccion.tema);
      }
    });
    return Array.from(temas).sort();
  }, [todasLecciones]);

  useEffect(() => {
    const cargarTodasLecciones = async () => {
      try {
        const data = await leccionesApi.list();
        setTodasLecciones(data);
      } catch (err) {
        console.error("Error al cargar temas:", err);
      }
    };

    cargarTodasLecciones();
  }, []);

  useEffect(() => {
    const cargarLecciones = async () => {
      try {
        setIsLoading(true);

        const filtros = {
          dificultad: dificultadFiltro !== "todas" ? dificultadFiltro : undefined,
          tema: temaFiltro !== "todos" ? temaFiltro : undefined,
        };

        const data = await leccionesApi.list(filtros);
        setLecciones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar lecciones");
      } finally {
        setIsLoading(false);
      }
    };

    cargarLecciones();
  }, [dificultadFiltro, temaFiltro]);

  const limpiarFiltros = () => {
    setDificultadFiltro("todas");
    setTemaFiltro("todos");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <PageHeader
              title="Lecciones de Náhuatl"
              description="Selecciona una lección para comenzar a aprender"
            />

            {user && (
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-gradient-sun-soft text-[#f3b62a] border border-[#f3b62a]/30 rounded-full font-medium flex items-center gap-1.5">
                  <Coins className="h-4 w-4" />
                  {user.tomin} tomins
                </span>
                <span className="px-3 py-1 bg-gradient-brown-soft text-[#d4a574] border border-[#d4a574]/30 rounded-full font-medium flex items-center gap-1.5">
                  <Heart className="h-4 w-4" fill="currentColor" />
                  {user.vidas} vidas
                </span>
                <span className="text-muted-foreground">
                  Lecciones completadas: {user.leccionesCompletadas.length}
                </span>
              </div>
            )}
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm text-red-700 underline"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          ) : (
            <LeccionesGrid lecciones={lecciones} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
