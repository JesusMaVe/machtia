import { useState, useCallback } from "react";
import type { Leccion, EstadoPractica, TipoDinamica } from "../../types";
import { DinamicaTraduccion } from "./DinamicaTraduccion";
import { SeleccionMultiple } from "./SeleccionMultiple";
import { Emparejamiento } from "./Emparejamiento";
import { NivelDificultadBadge } from "../molecules/NivelDificultadBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Coins } from "lucide-react";
import { Link } from "react-router";
import {
  generarOpcionesMultiple,
  generarParesEmparejamiento,
  obtenerDinamicaPorIndice,
} from "../../utils/dinamicasUtils";

interface DynamicaRouterProps {
  leccion: Leccion;
  onComplete: () => void;
  onFail: () => void;
}

export function DynamicaRouter({ leccion, onComplete, onFail }: DynamicaRouterProps) {
  const [estado, setEstado] = useState<EstadoPractica>({
    leccionId: leccion.id,
    palabraActual: 0,
    totalPalabras: leccion.palabras.length,
    respuestasCorrectas: 0,
    respuestasIncorrectas: 0,
    dinamicaActual: 'traduccion',
    indexEnCiclo: 0,
  });

  const [mostrarResultado, setMostrarResultado] = useState(false);

  const palabraActual = leccion.palabras[estado.palabraActual];
  const progreso = ((estado.palabraActual + 1) / estado.totalPalabras) * 100;
  const esFinal = estado.palabraActual === estado.totalPalabras - 1;

  // Determinar el tipo de dinámica actual basado en el índice
  const dinamicaActual = obtenerDinamicaPorIndice(estado.indexEnCiclo || 0);

  // Manejar la respuesta y avanzar a la siguiente palabra/dinámica
  const handleRespuesta = useCallback((esCorrecta: boolean) => {
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
        indexEnCiclo: (estado.indexEnCiclo || 0) + 1,
      });
    }
  }, [estado, esFinal, onComplete, onFail]);

  // Manejar el resultado del emparejamiento (puede tener múltiples palabras)
  const handleEmparejamientoComplete = useCallback((correctos: number, total: number) => {
    // Para emparejamiento, contamos cada par como una respuesta
    // El emparejamiento usa 3 palabras, así que avanzamos 3 posiciones
    const palabrasEnEmparejamiento = 3;
    const nuevaPosicion = Math.min(
      estado.palabraActual + palabrasEnEmparejamiento,
      estado.totalPalabras
    );

    // Calcular cuántas respuestas fueron correctas basándose en el ratio
    const respuestasCorrectas = Math.round((correctos / total) * palabrasEnEmparejamiento);
    const respuestasIncorrectas = palabrasEnEmparejamiento - respuestasCorrectas;

    const nuevoEstado = {
      ...estado,
      palabraActual: nuevaPosicion,
      respuestasCorrectas: estado.respuestasCorrectas + respuestasCorrectas,
      respuestasIncorrectas: estado.respuestasIncorrectas + respuestasIncorrectas,
      indexEnCiclo: (estado.indexEnCiclo || 0) + 1,
    };

    if (nuevaPosicion >= estado.totalPalabras) {
      const porcentajeAciertos = (nuevoEstado.respuestasCorrectas / estado.totalPalabras) * 100;

      setEstado(nuevoEstado);
      setMostrarResultado(true);

      if (porcentajeAciertos >= 70) {
        onComplete();
      } else {
        onFail();
      }
    } else {
      setEstado(nuevoEstado);
    }
  }, [estado, onComplete, onFail]);

  // Obtener las palabras para el emparejamiento (3 palabras desde la posición actual)
  const getPalabrasParaEmparejamiento = () => {
    const inicio = estado.palabraActual;
    const fin = Math.min(inicio + 3, leccion.palabras.length);
    return leccion.palabras.slice(inicio, fin);
  };

  // Reiniciar la lección
  const reiniciarLeccion = () => {
    setEstado({
      leccionId: leccion.id,
      palabraActual: 0,
      totalPalabras: leccion.palabras.length,
      respuestasCorrectas: 0,
      respuestasIncorrectas: 0,
      dinamicaActual: 'traduccion',
      indexEnCiclo: 0,
    });
    setMostrarResultado(false);
  };

  // Pantalla de resultados
  if (mostrarResultado) {
    const porcentajeAciertos = (estado.respuestasCorrectas / estado.totalPalabras) * 100;
    const aprobado = porcentajeAciertos >= 70;
    const esModoPractica = leccion.completada;

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="text-center">
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
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <p
                  className={`text-4xl font-bold ${aprobado ? "text-[#76b57b] dark:text-purple-400" : "text-gray-400"}`}
                >
                  {estado.respuestasCorrectas}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Correctas</p>
              </div>
              <div className="p-5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <p
                  className={`text-4xl font-bold ${!aprobado ? "text-[#d4a574] dark:text-orange-400" : "text-gray-400"}`}
                >
                  {estado.respuestasIncorrectas}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Incorrectas</p>
              </div>
            </div>

            <div className="text-center py-2">
              <p className="text-5xl font-bold text-obsidiana dark:text-white">
                {Math.round(porcentajeAciertos)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">Porcentaje de aciertos</p>
            </div>

            {aprobado && !esModoPractica && (
              <div className="text-center p-4 bg-white dark:bg-[#0a0a0a] border-2 border-[#f3b62a] rounded-lg">
                <p className="text-lg font-semibold text-[#f3b62a] flex items-center justify-center gap-2">
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
                      className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Link to="/aprende">
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Volver a Aprende
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="flex-1 bg-gradient-jade hover:shadow-jade-glow text-white transition-all duration-300"
                    >
                      <Link to="/lecciones">Ver Catálogo</Link>
                    </Button>
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Continúa tu aprendizaje o explora más lecciones
                  </p>
                </>
              ) : (
                <div className="flex gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Link to="/aprende">
                      <ArrowLeftIcon className="mr-2 h-4 w-4" />
                      Volver a Aprende
                    </Link>
                  </Button>
                  <Button
                    onClick={reiniciarLeccion}
                    className="flex-1 bg-gradient-jade hover:shadow-jade-glow text-white transition-all duration-300"
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

  // Renderizar la dinámica actual
  const renderDinamica = () => {
    switch (dinamicaActual) {
      case 'traduccion':
        return (
          <DinamicaTraduccion
            palabra={palabraActual}
            onRespuesta={handleRespuesta}
          />
        );

      case 'seleccion_multiple':
        const opciones = generarOpcionesMultiple(palabraActual, leccion.palabras, 4);
        return (
          <SeleccionMultiple
            palabra={palabraActual}
            opciones={opciones}
            onRespuesta={handleRespuesta}
          />
        );

      case 'emparejamiento':
        const palabrasParaEmparejamiento = getPalabrasParaEmparejamiento();
        const pares = generarParesEmparejamiento(palabrasParaEmparejamiento);
        return (
          <Emparejamiento
            pares={pares}
            onComplete={handleEmparejamientoComplete}
          />
        );

      default:
        return (
          <DinamicaTraduccion
            palabra={palabraActual}
            onRespuesta={handleRespuesta}
          />
        );
    }
  };

  // Obtener nombre amigable de la dinámica
  const getNombreDinamica = (tipo: TipoDinamica): string => {
    switch (tipo) {
      case 'traduccion':
        return 'Traducción';
      case 'seleccion_multiple':
        return 'Selección Múltiple';
      case 'emparejamiento':
        return 'Emparejamiento';
      default:
        return 'Ejercicio';
    }
  };

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

      {/* Header */}
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

      {/* Progreso y tipo de dinámica */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>
            Palabra {estado.palabraActual + 1} de {estado.totalPalabras}
            <span className="mx-2">•</span>
            <span className="text-[#2db3b6] dark:text-orange-400 font-medium">
              {getNombreDinamica(dinamicaActual)}
            </span>
          </span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <Progress value={progreso} className="h-2" />
      </div>

      {/* Dinámica actual */}
      <div className="py-4">
        {renderDinamica()}
      </div>

      {/* Contadores (solo para traducción y selección múltiple) */}
      {dinamicaActual !== 'emparejamiento' && (
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckIcon className="h-4 w-4 text-[#76b57b] dark:text-purple-400" />
            {estado.respuestasCorrectas} correctas
          </span>
          <span className="flex items-center gap-1">
            <Cross2Icon className="h-4 w-4 text-[#d4a574] dark:text-orange-400" />
            {estado.respuestasIncorrectas} incorrectas
          </span>
        </div>
      )}
    </div>
  );
}
