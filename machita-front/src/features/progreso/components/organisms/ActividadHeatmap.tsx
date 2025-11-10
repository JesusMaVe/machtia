import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DiaActividad } from "../../types";

interface ActividadHeatmapProps {
  diasActividad: DiaActividad[];
  periodo: {
    dias: number;
    fechaInicio: string;
    fechaFin: string;
  };
  onPeriodoChange?: (dias: number) => void;
}

function getColorIntensity(leccionesCompletadas: number): string {
  if (leccionesCompletadas === 0) {
    return "bg-muted"; // Gris claro para días sin actividad
  }
  if (leccionesCompletadas === 1) {
    return "bg-green-200"; // Verde muy claro
  }
  if (leccionesCompletadas === 2) {
    return "bg-green-400"; // Verde medio
  }
  if (leccionesCompletadas >= 3) {
    return "bg-green-600"; // Verde oscuro
  }
  return "bg-muted";
}

function formatearFecha(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ActividadHeatmap({
  diasActividad,
  periodo,
  onPeriodoChange,
}: ActividadHeatmapProps) {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(periodo?.dias || 30);

  const handlePeriodoChange = (dias: number) => {
    setPeriodoSeleccionado(dias);
    onPeriodoChange?.(dias);
  };

  const generarDiasPeriodo = (): DiaActividad[] => {
    if (!periodo) return [];

    const fechaFin = new Date(periodo.fechaFin);
    const fechaInicio = new Date(periodo.fechaInicio);
    const dias: DiaActividad[] = [];

    const actividadMap = new Map(diasActividad.map((dia) => [dia.fecha, dia]));

    for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
      const fechaStr = fecha.toISOString().split("T")[0];
      const actividad = actividadMap.get(fechaStr);

      dias.push(
        actividad || {
          fecha: fechaStr,
          leccionesCompletadas: 0,
          tominsGanados: 0,
          tiempoEstudio: 0,
        }
      );
    }

    return dias;
  };

  const todosDias = generarDiasPeriodo();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Actividad de Estudio</CardTitle>
            <CardDescription>
              Historial de lecciones completadas en los últimos{" "}
              {periodoSeleccionado === 7 ? "7 días" : "30 días"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={periodoSeleccionado === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodoChange(7)}
            >
              7 días
            </Button>
            <Button
              variant={periodoSeleccionado === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodoChange(30)}
            >
              30 días
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${Math.min(todosDias.length, 30)}, minmax(0, 1fr))`,
              }}
            >
              {todosDias.map((dia) => (
                <Tooltip key={dia.fecha}>
                  <TooltipTrigger asChild>
                    <div
                      className={`aspect-square rounded-sm transition-colors hover:ring-2 hover:ring-primary ${getColorIntensity(
                        dia.leccionesCompletadas
                      )}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{formatearFecha(dia.fecha)}</p>
                      <p className="text-sm">
                        {dia.leccionesCompletadas === 0
                          ? "Sin actividad"
                          : dia.leccionesCompletadas === 1
                            ? "1 lección completada"
                            : `${dia.leccionesCompletadas} lecciones completadas`}
                      </p>
                      {dia.leccionesCompletadas > 0 && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {dia.tominsGanados} tomins ganados
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {dia.tiempoEstudio} minutos de estudio
                          </p>
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Menos</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-green-200" />
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <div className="w-3 h-3 rounded-sm bg-green-600" />
              </div>
              <span>Más</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
