import { useState, useMemo, useEffect } from "react";
import type { ParEmparejamiento } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { shuffle } from "../../utils/dinamicasUtils";

interface EmparejamientoProps {
  pares: ParEmparejamiento[];
  onComplete: (correctos: number, total: number) => void;
}

export function Emparejamiento({ pares, onComplete }: EmparejamientoProps) {
  const [seleccionNahuatl, setSeleccionNahuatl] = useState<string | null>(null);
  const [paresCompletados, setParesCompletados] = useState<string[]>([]);
  const [errores, setErrores] = useState(0);
  const [ultimoError, setUltimoError] = useState<{ nahuatl: string; espanol: string } | null>(null);
  const [ultimoAcierto, setUltimoAcierto] = useState<string | null>(null);

  // Mezclar opciones al montar el componente
  const opcionesNahuatl = useMemo(() => shuffle(pares.map(p => p.nahuatl)), [pares]);
  const opcionesEspanol = useMemo(() => shuffle(pares.map(p => p.espanol)), [pares]);

  // Crear un mapa para buscar la traducción correcta
  const traducciones = useMemo(() => {
    const map = new Map<string, string>();
    pares.forEach(par => {
      map.set(par.nahuatl, par.espanol);
    });
    return map;
  }, [pares]);

  const progreso = (paresCompletados.length / pares.length) * 100;

  const handleSeleccionNahuatl = (nahuatl: string) => {
    if (paresCompletados.includes(nahuatl)) return;
    setSeleccionNahuatl(nahuatl);
    setUltimoError(null);
  };

  const handleSeleccionEspanol = (espanol: string) => {
    if (!seleccionNahuatl) return;

    // Verificar si el español ya está emparejado
    const nahuatlCorrecto = pares.find(p => p.espanol === espanol)?.nahuatl;
    if (nahuatlCorrecto && paresCompletados.includes(nahuatlCorrecto)) return;

    const traduccionCorrecta = traducciones.get(seleccionNahuatl);

    if (espanol === traduccionCorrecta) {
      // Acierto
      setParesCompletados([...paresCompletados, seleccionNahuatl]);
      setUltimoAcierto(seleccionNahuatl);
      setUltimoError(null);
      setSeleccionNahuatl(null);

      // Limpiar animación de acierto después de un momento
      setTimeout(() => {
        setUltimoAcierto(null);
      }, 500);
    } else {
      // Error
      setErrores(errores + 1);
      setUltimoError({ nahuatl: seleccionNahuatl, espanol });

      // Limpiar selección después de mostrar el error
      setTimeout(() => {
        setSeleccionNahuatl(null);
        setUltimoError(null);
      }, 800);
    }
  };

  // Verificar si se completaron todos los pares
  useEffect(() => {
    if (paresCompletados.length === pares.length && pares.length > 0) {
      // Dar tiempo para ver la animación final
      setTimeout(() => {
        const correctos = pares.length - errores;
        onComplete(Math.max(0, correctos), pares.length);
      }, 800);
    }
  }, [paresCompletados, pares.length, errores, onComplete]);

  const getNahuatlClasses = (nahuatl: string) => {
    const completado = paresCompletados.includes(nahuatl);
    const seleccionado = seleccionNahuatl === nahuatl;
    const esError = ultimoError?.nahuatl === nahuatl;
    const esAcierto = ultimoAcierto === nahuatl;

    if (completado) {
      return cn(
        "w-full h-12 transition-all duration-300",
        "bg-gradient-verde-soft border-[#76b57b] text-[#76b57b] opacity-60",
        "dark:bg-purple-500/10 dark:border-purple-500 dark:text-purple-400"
      );
    }

    if (esAcierto) {
      return cn(
        "w-full h-12 transition-all duration-300",
        "bg-gradient-verde-soft border-[#76b57b] text-[#76b57b]",
        "dark:bg-purple-500/10 dark:border-purple-500 dark:text-purple-400",
        "scale-105"
      );
    }

    if (esError) {
      return cn(
        "w-full h-12 transition-all duration-300",
        "bg-gradient-brown-soft border-[#d4a574] text-[#d4a574]",
        "dark:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400",
        "animate-pulse"
      );
    }

    if (seleccionado) {
      return cn(
        "w-full h-12 transition-all duration-300",
        "ring-2 ring-[#2db3b6] bg-gradient-jade-soft border-[#2db3b6]",
        "dark:ring-orange-500 dark:bg-orange-500/10 dark:border-orange-500"
      );
    }

    return cn(
      "w-full h-12 transition-all duration-300",
      "border-gray-300 dark:border-gray-600",
      "hover:border-[#2db3b6] hover:bg-gradient-jade-soft",
      "dark:hover:border-orange-500"
    );
  };

  const getEspanolClasses = (espanol: string) => {
    // Encontrar si este español está emparejado
    const parCompletado = pares.find(p => p.espanol === espanol && paresCompletados.includes(p.nahuatl));
    const esError = ultimoError?.espanol === espanol;

    if (parCompletado) {
      return cn(
        "w-full h-12 transition-all duration-300",
        "bg-gradient-verde-soft border-[#76b57b] text-[#76b57b] opacity-60",
        "dark:bg-purple-500/10 dark:border-purple-500 dark:text-purple-400"
      );
    }

    if (esError) {
      return cn(
        "w-full h-12 transition-all duration-300",
        "bg-gradient-brown-soft border-[#d4a574] text-[#d4a574]",
        "dark:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400",
        "animate-pulse"
      );
    }

    return cn(
      "w-full h-12 transition-all duration-300",
      "border-gray-300 dark:border-gray-600",
      seleccionNahuatl
        ? "hover:border-[#2db3b6] hover:bg-gradient-jade-soft dark:hover:border-orange-500"
        : "opacity-70 cursor-not-allowed"
    );
  };

  return (
    <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
      <CardContent className="p-6 space-y-6">
        {/* Instrucciones y progreso */}
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold text-obsidiana dark:text-white">
            Conecta cada palabra con su traducción
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selecciona primero una palabra en náhuatl, luego su traducción
          </p>
          <Progress value={progreso} className="h-2" />
          <p className="text-xs text-gray-400">
            {paresCompletados.length} de {pares.length} pares completados
          </p>
        </div>

        {/* Columnas de emparejamiento */}
        <div className="grid grid-cols-2 gap-4">
          {/* Columna Náhuatl */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-obsidiana dark:text-white mb-2">
              Náhuatl
            </p>
            {opcionesNahuatl.map((nahuatl) => (
              <Button
                key={nahuatl}
                variant="outline"
                onClick={() => handleSeleccionNahuatl(nahuatl)}
                disabled={paresCompletados.includes(nahuatl)}
                className={getNahuatlClasses(nahuatl)}
              >
                {paresCompletados.includes(nahuatl) && (
                  <CheckIcon className="h-4 w-4 mr-2" />
                )}
                {nahuatl}
              </Button>
            ))}
          </div>

          {/* Columna Español */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-obsidiana dark:text-white mb-2">
              Español
            </p>
            {opcionesEspanol.map((espanol) => {
              const parCompletado = pares.find(p => p.espanol === espanol && paresCompletados.includes(p.nahuatl));
              return (
                <Button
                  key={espanol}
                  variant="outline"
                  onClick={() => handleSeleccionEspanol(espanol)}
                  disabled={!!parCompletado || !seleccionNahuatl}
                  className={getEspanolClasses(espanol)}
                >
                  {parCompletado && (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  {espanol}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Contador de errores */}
        {errores > 0 && (
          <div className="text-center pt-2">
            <p className="text-sm text-[#d4a574] dark:text-orange-400 flex items-center justify-center gap-1">
              <Cross2Icon className="h-4 w-4" />
              {errores} {errores === 1 ? "error" : "errores"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
