import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/features/auth";
import {
  progresoApi,
  RachaWidget,
  LogrosGrid,
  EstadisticasCard,
  type Racha,
  type Estadisticas,
  type Logro,
  type ActividadUsuario,
} from "@/features/progreso";
import { ActividadHeatmap } from "@/features/progreso/components/organisms/ActividadHeatmap";
import { PageHeader } from "@/shared/components/molecules";
import { LoadingButton } from "@/shared/components/atoms";

export default function ProgresoPage() {
  const [racha, setRacha] = useState<Racha | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [logros, setLogros] = useState<Logro[]>([]);
  const [actividad, setActividad] = useState<ActividadUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodoActividad, setPeriodoActividad] = useState<number>(30);

  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        setIsLoading(true);

        const [rachaData, estadisticasData, logrosData, actividadData] = await Promise.all([
          progresoApi.getRacha(),
          progresoApi.getEstadisticas(),
          progresoApi.getLogros(),
          progresoApi.getActividad(periodoActividad),
        ]);

        setRacha(rachaData);
        setEstadisticas(estadisticasData);
        setLogros(logrosData);
        setActividad(actividadData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar progreso");
      } finally {
        setIsLoading(false);
      }
    };

    cargarProgreso();
  }, [periodoActividad]);

  const handlePeriodoChange = async (dias: number) => {
    try {
      setPeriodoActividad(dias);
      const actividadData = await progresoApi.getActividad(dias);
      setActividad(actividadData);
    } catch (err) {
      console.error("Error al cambiar período:", err);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingButton isLoading={true} disabled>
            Cargando progreso...
          </LoadingButton>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <PageHeader
              title="Mi Progreso"
              description="Revisa tus logros, estadísticas y racha de estudio"
            />
          </div>

          {actividad && (
            <div className="mb-8">
              <ActividadHeatmap
                diasActividad={actividad.actividad.historial}
                periodo={actividad.periodo}
                onPeriodoChange={handlePeriodoChange}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1 space-y-6">
              {racha && <RachaWidget racha={racha} />}
              {estadisticas && <EstadisticasCard estadisticas={estadisticas} />}
            </div>

            <div className="lg:col-span-2">
              <LogrosGrid logros={logros} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
