import { useEffect, useState } from "react";
import {
  progresoApi,
  LogrosGrid,
  type Racha,
  type Estadisticas,
  type Logro,
} from "@/features/progreso";
import { PageHeader } from "@/shared/components/molecules";
import { LoadingButton } from "@/shared/components/atoms";
import { Card, CardContent } from "@/components/ui/card";

export default function ProgresoPage() {
  const [racha, setRacha] = useState<Racha | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [logros, setLogros] = useState<Logro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        setIsLoading(true);

        const [rachaData, estadisticasData, logrosData] = await Promise.all([
          progresoApi.getRacha(),
          progresoApi.getEstadisticas(),
          progresoApi.getLogros(),
        ]);

        setRacha(rachaData);
        setEstadisticas(estadisticasData);
        setLogros(logrosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar progreso");
      } finally {
        setIsLoading(false);
      }
    };

    cargarProgreso();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingButton isLoading={true} disabled>
          Cargando progreso...
        </LoadingButton>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <PageHeader
            title="Mi Progreso"
            description="Revisa tus logros y estadísticas de aprendizaje"
          />
        </div>

        {/* Sección de estadísticas rápidas - Minimalist white cards */}
        {estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-[#2db3b6]">
                  {estadisticas.leccionesCompletadas}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Lecciones completadas</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-[#f3b62a]">
                  {estadisticas.tominsAcumulados}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Tomins acumulados</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-[#2db3b6]">
                  {estadisticas.palabrasAprendidas}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Palabras aprendidas</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-[#2db3b6]">{racha?.diasActuales || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {racha && racha.diasActuales === 1 ? "Día" : "Días"} de racha
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logros */}
        <div>
          <LogrosGrid logros={logros} />
        </div>
      </div>
    </div>
  );
}
