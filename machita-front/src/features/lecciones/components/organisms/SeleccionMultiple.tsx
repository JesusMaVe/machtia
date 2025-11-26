import { useState } from "react";
import type { Palabra } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/shared/components/atoms/AudioPlayer";

interface SeleccionMultipleProps {
  palabra: Palabra;
  opciones: string[];
  onRespuesta: (esCorrecta: boolean) => void;
}

export function SeleccionMultiple({ palabra, opciones, onRespuesta }: SeleccionMultipleProps) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const handleSeleccion = (opcion: string) => {
    if (mostrarResultado) return;

    setSeleccionada(opcion);
    setMostrarResultado(true);

    const esCorrecta = opcion === palabra.espanol;

    // Dar tiempo para ver el feedback visual antes de avanzar
    setTimeout(() => {
      onRespuesta(esCorrecta);
    }, 1200);
  };

  const getOpcionClasses = (opcion: string) => {
    if (!mostrarResultado) {
      return cn(
        "h-14 text-base transition-all duration-300",
        "border-gray-300 dark:border-gray-600",
        "hover:border-[#2db3b6] hover:bg-gradient-jade-soft",
        "dark:hover:border-orange-500"
      );
    }

    const esCorrecta = opcion === palabra.espanol;
    const esSeleccionada = opcion === seleccionada;

    if (esCorrecta) {
      return cn(
        "h-14 text-base transition-all duration-300",
        "border-[#76b57b] bg-gradient-verde-soft text-[#76b57b]",
        "dark:border-purple-500 dark:bg-purple-500/10 dark:text-purple-400"
      );
    }

    if (esSeleccionada && !esCorrecta) {
      return cn(
        "h-14 text-base transition-all duration-300",
        "border-[#d4a574] bg-gradient-brown-soft text-[#d4a574]",
        "dark:border-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
      );
    }

    return cn(
      "h-14 text-base transition-all duration-300",
      "border-gray-200 dark:border-gray-700 opacity-50"
    );
  };

  return (
    <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
      <CardContent className="p-8 space-y-8">
        {/* Pregunta */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">¿Cuál es la traducción de:</p>
          <h2 className="text-4xl font-bold text-obsidiana dark:text-white">{palabra.nahuatl}</h2>
          {palabra.audio && (
            <div className="flex justify-center">
              <AudioPlayer audioUrl={palabra.audio} size="md" variant="outline" />
            </div>
          )}
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {opciones.map((opcion, index) => (
            <Button
              key={`${opcion}-${index}`}
              variant="outline"
              onClick={() => handleSeleccion(opcion)}
              className={getOpcionClasses(opcion)}
              disabled={mostrarResultado}
            >
              <span className="flex items-center gap-2">
                {mostrarResultado && opcion === palabra.espanol && (
                  <CheckIcon className="h-5 w-5" />
                )}
                {mostrarResultado && opcion === seleccionada && opcion !== palabra.espanol && (
                  <Cross2Icon className="h-5 w-5" />
                )}
                {opcion}
              </span>
            </Button>
          ))}
        </div>

        {/* Feedback visual */}
        {mostrarResultado && (
          <div className="text-center pt-4">
            {seleccionada === palabra.espanol ? (
              <p className="text-[#76b57b] dark:text-purple-400 font-medium flex items-center justify-center gap-2">
                <CheckIcon className="h-5 w-5" />
                ¡Correcto!
              </p>
            ) : (
              <p className="text-[#d4a574] dark:text-orange-400 font-medium flex items-center justify-center gap-2">
                <Cross2Icon className="h-5 w-5" />
                La respuesta correcta es: {palabra.espanol}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
