import type { Estadisticas } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Coins, Clock, Languages } from "lucide-react";

interface EstadisticasCardProps {
  estadisticas: Estadisticas;
}

export function EstadisticasCard({ estadisticas }: EstadisticasCardProps) {
  const {
    leccionesCompletadas,
    totalLecciones,
    tominsAcumulados,
    tominsGastados,
    horasEstudio,
    palabrasAprendidas,
    nivel,
    progreso,
  } = estadisticas;

  const porcentajeLecciones = (leccionesCompletadas / totalLecciones) * 100;
  const tominsDisponibles = tominsAcumulados - tominsGastados;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Estadísticas</span>
          <span className="text-sm font-normal text-gray-600">Nivel: {nivel}</span>
        </CardTitle>
        <CardDescription>Tu progreso de aprendizaje</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progreso General</span>
            <span className="font-semibold text-primary">{progreso}%</span>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {leccionesCompletadas}
                <span className="text-sm text-muted-foreground">/{totalLecciones}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Lecciones</p>
            <Progress value={porcentajeLecciones} className="h-1 mt-2" />
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {tominsDisponibles}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Tomins</p>
            <p className="text-xs text-muted-foreground mt-1">Total: {tominsAcumulados}</p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{horasEstudio}</p>
            </div>
            <p className="text-xs text-muted-foreground">Horas de estudio</p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Languages className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {palabrasAprendidas}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Palabras</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tomins gastados:</span>
            <span className="font-semibold text-gray-700">{tominsGastados}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
