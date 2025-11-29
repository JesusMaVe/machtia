import { useLoaderData } from "react-router";
import { progresoApi, LogrosGrid } from "@/features/progreso";
import { PageHeader } from "@/shared/components/molecules";
import { LoadingButton } from "@/shared/components/atoms";
import { Card, CardContent } from "@/components/ui/card";
import type { Route } from "./+types/progreso";

export async function clientLoader() {
  try {
    const [rachaData, estadisticasData, logrosData] = await Promise.all([
      progresoApi.getRacha(),
      progresoApi.getEstadisticas(),
      progresoApi.getLogros(),
    ]);

    return {
      racha: rachaData,
      estadisticas: estadisticasData,
      logros: logrosData,
    };
  } catch (err) {
    throw new Response("Error al cargar progreso", { status: 500 });
  }
}

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingButton isLoading={true} disabled>
        Cargando progreso...
      </LoadingButton>
    </div>
  );
}

export default function ProgresoPage() {
  const { racha, estadisticas, logros } = useLoaderData<typeof clientLoader>();

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
