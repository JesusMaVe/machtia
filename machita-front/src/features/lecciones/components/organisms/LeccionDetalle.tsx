import { useLeccionPractica } from "../../hooks/useLeccionPractica";
import type { Leccion } from "../../types";
import { PalabraCard } from "../molecules/PalabraCard";
import { NivelDificultadBadge } from "../molecules/NivelDificultadBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Coins } from "lucide-react";
import { Link } from "react-router";

interface LeccionDetalleProps {
  leccion: Leccion;
  onComplete: () => void;
  onFail: () => void;
}

export function LeccionDetalle({ leccion, onComplete, onFail }: LeccionDetalleProps) {
  const {
    estado,
    mostrarResultado,
    palabraActual,
    progreso,
    handleRespuesta,
    reiniciar,
  } = useLeccionPractica({ leccion, onComplete, onFail });

  if (mostrarResultado) {
    const porcentajeAciertos = (estado.respuestasCorrectas / estado.totalPalabras) * 100;
    const aprobado = porcentajeAciertos >= 70;
    const esModoPractica = leccion.completada;

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white dark:bg-card border-border shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              {aprobado ? (
                <div className="h-20 w-20 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-sm">
                  <CheckIcon className="h-10 w-10 text-white" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-amber-500 dark:bg-amber-600 flex items-center justify-center shadow-sm">
                  <Cross2Icon className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl text-foreground">
              {esModoPractica
                ? aprobado
                  ? "¡Práctica Completada!"
                  : "Práctica - Inténtalo de Nuevo"
                : aprobado
                  ? "¡Lección Completada!"
                  : "Inténtalo de Nuevo"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {esModoPractica
                ? aprobado
                  ? `Modo práctica: "${leccion.titulo}" - Sin vidas ni tomins`
                  : "Modo práctica: Necesitas al menos 70% de aciertos"
                : aprobado
                  ? `Has completado la lección "${leccion.titulo}"`
                  : "Necesitas al menos 70% de aciertos para aprobar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-5 bg-card border border-border rounded-lg shadow-sm">
                <p
                  className={`text-4xl font-bold ${aprobado ? "text-green-500 dark:text-green-400" : "text-muted-foreground"}`}
                >
                  {estado.respuestasCorrectas}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Correctas</p>
              </div>
              <div className="p-5 bg-card border border-border rounded-lg shadow-sm">
                <p
                  className={`text-4xl font-bold ${!aprobado ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"}`}
                >
                  {estado.respuestasIncorrectas}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Incorrectas</p>
              </div>
            </div>

            <div className="text-center py-2">
              <p className="text-5xl font-bold text-foreground">
                {Math.round(porcentajeAciertos)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">Porcentaje de aciertos</p>
            </div>

            {aprobado && !esModoPractica && (
              <div className="text-center p-4 bg-card border-2 border-yellow-400 rounded-lg">
                <p className="text-lg font-semibold text-yellow-500 flex items-center justify-center gap-2">
                  <Coins className="h-5 w-5" />+{leccion.tomins} tomins ganados
                </p>
              </div>
            )}

            {esModoPractica && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Modo práctica: Esta lección ya fue completada.
                  <br />
                  No ganas tomins ni pierdes vidas al practicar.
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              {aprobado ? (
                <>
                  <div className="flex gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
                      <Link to="/aprende">
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Volver a Aprende
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Link to="/lecciones">Ver Catálogo</Link>
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Continúa tu aprendizaje o explora más lecciones
                  </p>
                </>
              ) : (
                <div className="flex gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                  >
                    <Link to="/aprende">
                      <ArrowLeftIcon className="mr-2 h-4 w-4" />
                      Volver a Aprende
                    </Link>
                  </Button>
                  <Button
                    onClick={reiniciar}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Intentar de Nuevo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {leccion.completada && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Modo Práctica - Esta lección ya fue completada. No ganarás tomins ni perderás vidas.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/lecciones">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {leccion.titulo}
              {leccion.completada && (
                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Práctica)</span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">{leccion.descripcion}</p>
          </div>
        </div>
        <NivelDificultadBadge dificultad={leccion.dificultad} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Palabra {estado.palabraActual + 1} de {estado.totalPalabras}
          </span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <Progress value={progreso} className="h-2" />
      </div>

      <div className="py-8">
        <PalabraCard palabra={palabraActual} />
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => handleRespuesta(false)}
          variant="outline"
          size="lg"
          className="min-w-[140px] text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/30"
        >
          <Cross2Icon className="mr-2 h-5 w-5" />
          No la sé
        </Button>
        <Button
          onClick={() => handleRespuesta(true)}
          size="lg"
          className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
        >
          <CheckIcon className="mr-2 h-5 w-5" />
          La aprendí
        </Button>
      </div>

      <div className="flex justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckIcon className="h-4 w-4 text-green-500" />
          {estado.respuestasCorrectas} correctas
        </span>
        <span className="flex items-center gap-1">
          <Cross2Icon className="h-4 w-4 text-amber-500" />
          {estado.respuestasIncorrectas} incorrectas
        </span>
      </div>
    </div>
  );
}
