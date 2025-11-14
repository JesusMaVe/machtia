import { useState } from "react";
import type { Leccion, EstadoPractica } from "../../types";
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
  const [estado, setEstado] = useState<EstadoPractica>({
    leccionId: leccion.id,
    palabraActual: 0,
    totalPalabras: leccion.palabras.length,
    respuestasCorrectas: 0,
    respuestasIncorrectas: 0,
  });

  const [mostrarResultado, setMostrarResultado] = useState(false);

  const palabraActual = leccion.palabras[estado.palabraActual];
  const progreso = ((estado.palabraActual + 1) / estado.totalPalabras) * 100;
  const esFinal = estado.palabraActual === estado.totalPalabras - 1;

  const handleRespuesta = (esCorrecta: boolean) => {
    const nuevoEstado = {
      ...estado,
      respuestasCorrectas: esCorrecta ? estado.respuestasCorrectas + 1 : estado.respuestasCorrectas,
      respuestasIncorrectas: !esCorrecta
        ? estado.respuestasIncorrectas + 1
        : estado.respuestasIncorrectas,
    };

    if (esFinal) {
      const porcentajeAciertos = (nuevoEstado.respuestasCorrectas / estado.totalPalabras) * 100;

      setEstado(nuevoEstado);
      setMostrarResultado(true);

      if (porcentajeAciertos >= 70) {
        onComplete();
      } else {
        onFail();
      }
    } else {
      setEstado({
        ...nuevoEstado,
        palabraActual: estado.palabraActual + 1,
      });
    }
  };

  const handleSiguiente = () => {
    if (esFinal) {
      setMostrarResultado(true);
    } else {
      setEstado({
        ...estado,
        palabraActual: estado.palabraActual + 1,
      });
    }
  };

  if (mostrarResultado) {
    const porcentajeAciertos = (estado.respuestasCorrectas / estado.totalPalabras) * 100;
    const aprobado = porcentajeAciertos >= 70;

    return (
      <div className="max-w-2xl mx-auto">
        <Card className={aprobado ? "border-green-600" : "border-red-500"}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {aprobado ? (
                <div className="h-20 w-20 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                  <CheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                  <Cross2Icon className="h-10 w-10 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {aprobado ? "¡Lección Completada!" : "Inténtalo de Nuevo"}
            </CardTitle>
            <CardDescription>
              {aprobado
                ? `Has completado la lección "${leccion.titulo}"`
                : "Necesitas al menos 70% de aciertos para aprobar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {estado.respuestasCorrectas}
                </p>
                <p className="text-sm text-gray-600">Correctas</p>
              </div>
              <div className="p-4 bg-red-100 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{estado.respuestasIncorrectas}</p>
                <p className="text-sm text-gray-600">Incorrectas</p>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-4xl font-bold text-foreground">
                {Math.round(porcentajeAciertos)}%
              </p>
              <p className="text-sm text-gray-600">Porcentaje de aciertos</p>
            </div>

            {aprobado && (
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <p className="text-lg font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
                  <Coins className="h-5 w-5" />+{leccion.tomins} tomins ganados
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/aprende">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Volver a Lecciones
                </Link>
              </Button>
              {!aprobado && (
                <Button
                  onClick={() => {
                    setEstado({
                      leccionId: leccion.id,
                      palabraActual: 0,
                      totalPalabras: leccion.palabras.length,
                      respuestasCorrectas: 0,
                      respuestasIncorrectas: 0,
                    });
                    setMostrarResultado(false);
                  }}
                  className="flex-1"
                >
                  Intentar de Nuevo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/lecciones">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{leccion.titulo}</h1>
            <p className="text-sm text-gray-600">{leccion.descripcion}</p>
          </div>
        </div>
        <NivelDificultadBadge dificultad={leccion.dificultad} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
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
          className="min-w-[140px] border-red-500 text-red-600 hover:bg-red-50"
        >
          <Cross2Icon className="mr-2 h-5 w-5" />
          No la sé
        </Button>
        <Button
          onClick={() => handleRespuesta(true)}
          size="lg"
          className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
        >
          <CheckIcon className="mr-2 h-5 w-5" />
          La aprendí
        </Button>
      </div>

      <div className="flex justify-center gap-6 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          {estado.respuestasCorrectas} correctas
        </span>
        <span className="flex items-center gap-1">
          <Cross2Icon className="h-4 w-4 text-red-500" />
          {estado.respuestasIncorrectas} incorrectas
        </span>
      </div>
    </div>
  );
}
