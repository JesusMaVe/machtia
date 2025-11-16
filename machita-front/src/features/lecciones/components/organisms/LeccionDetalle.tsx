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
    const esModoPractica = leccion.completada; // Si ya está completada, es modo práctica

    return (
      <div className="max-w-2xl mx-auto">
        {/* MINIMALIST DESIGN: White card with subtle shadow - color only on icon, numbers, and CTA */}
        <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="text-center">
            {/* Icon Circle: Only colored element at top - green for success, brown for retry */}
            <div className="flex justify-center mb-6">
              {aprobado ? (
                <div className="h-20 w-20 rounded-full bg-[#76b57b] dark:bg-purple-600 flex items-center justify-center shadow-sm">
                  <CheckIcon className="h-10 w-10 text-white" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-[#d4a574] dark:bg-orange-600 flex items-center justify-center shadow-sm">
                  <Cross2Icon className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            {/* Title: Black text, no colored backgrounds */}
            <CardTitle className="text-2xl text-obsidiana dark:text-white">
              {esModoPractica
                ? aprobado
                  ? "¡Práctica Completada!"
                  : "Práctica - Inténtalo de Nuevo"
                : aprobado
                  ? "¡Lección Completada!"
                  : "Inténtalo de Nuevo"}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
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
            {/* Stats Cards: WHITE backgrounds, color only on numbers */}
            <div className="grid grid-cols-2 gap-4 text-center">
              {/* Correctas Card: White background, green number only */}
              <div className="p-5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <p
                  className={`text-4xl font-bold ${aprobado ? "text-[#76b57b] dark:text-purple-400" : "text-gray-400"}`}
                >
                  {estado.respuestasCorrectas}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Correctas</p>
              </div>
              {/* Incorrectas Card: White background, brown number only (or gray if passed) */}
              <div className="p-5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <p
                  className={`text-4xl font-bold ${!aprobado ? "text-[#d4a574] dark:text-orange-400" : "text-gray-400"}`}
                >
                  {estado.respuestasIncorrectas}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Incorrectas</p>
              </div>
            </div>

            {/* Percentage: Black text, no colored background */}
            <div className="text-center py-2">
              <p className="text-5xl font-bold text-obsidiana dark:text-white">
                {Math.round(porcentajeAciertos)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">Porcentaje de aciertos</p>
            </div>

            {/* Tomin Badge: Gold color - SOLO si NO es modo práctica y aprobó */}
            {aprobado && !esModoPractica && (
              <div className="text-center p-4 bg-white dark:bg-[#0a0a0a] border-2 border-[#f3b62a] rounded-lg">
                <p className="text-lg font-semibold text-[#f3b62a] flex items-center justify-center gap-2">
                  <Coins className="h-5 w-5" />+{leccion.tomins} tomins ganados
                </p>
              </div>
            )}

            {/* Mensaje informativo en modo práctica */}
            {esModoPractica && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Modo práctica: Esta lección ya fue completada.
                  <br />
                  No ganas tomins ni pierdes vidas al practicar.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {/* Back button: Neutral outline, no colored backgrounds */}
              <Button
                asChild
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Link to="/aprende">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Volver a Lecciones
                </Link>
              </Button>
              {/* Retry CTA: Turquoise primary button (only colored CTA) */}
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
                  className="flex-1 bg-gradient-jade hover:shadow-jade-glow text-white transition-all duration-300"
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
      {/* Banner de modo práctica */}
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
            <h1 className="text-2xl font-bold text-obsidiana dark:text-white">
              {leccion.titulo}
              {leccion.completada && (
                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Práctica)</span>
              )}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">{leccion.descripcion}</p>
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
          className="min-w-[140px] border-[#d4a574]/50 text-[#d4a574] hover:bg-gradient-brown-soft"
        >
          <Cross2Icon className="mr-2 h-5 w-5" />
          No la sé
        </Button>
        <Button
          onClick={() => handleRespuesta(true)}
          size="lg"
          className="min-w-[140px] bg-gradient-jade hover:shadow-jade-glow text-white"
        >
          <CheckIcon className="mr-2 h-5 w-5" />
          La aprendí
        </Button>
      </div>

      <div className="flex justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckIcon className="h-4 w-4 text-[#76b57b]" />
          {estado.respuestasCorrectas} correctas
        </span>
        <span className="flex items-center gap-1">
          <Cross2Icon className="h-4 w-4 text-[#d4a574]" />
          {estado.respuestasIncorrectas} incorrectas
        </span>
      </div>
    </div>
  );
}
