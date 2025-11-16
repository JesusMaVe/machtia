import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router";
import {
  RocketIcon,
  LockClosedIcon,
  TriangleUpIcon,
  ReaderIcon,
  ClockIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons";
import type { Nivel } from "@/features/niveles/types";
import type { Leccion } from "@/features/lecciones/types";
import { Progress } from "@/components/ui/progress";

interface ProgresoNivel {
  leccionesCompletadas: number;
  totalLecciones: number;
  desbloqueado: boolean;
}

interface PyramidHeroProps {
  niveles: Nivel[];
  nivelActualNumero: number;
  proximaLeccion: Leccion | null;
  progresoNiveles: Record<number, ProgresoNivel>;
  onNivelClick?: (nivelNumero: number) => void;
  vidasDisponibles: number;
}

export function PyramidHero({
  niveles,
  nivelActualNumero,
  proximaLeccion,
  progresoNiveles,
  onNivelClick,
  vidasDisponibles,
}: PyramidHeroProps) {
  const navigate = useNavigate();

  const getNivelByNumero = (numero: number) => {
    return niveles.find((n) => n.numero === numero);
  };

  const getNivelClass = (numero: number) => {
    const progreso = progresoNiveles[numero];
    const isActual = numero === nivelActualNumero;
    const isDesbloqueado = progreso?.desbloqueado;
    const isCompletado = progreso && progreso.leccionesCompletadas === progreso.totalLecciones;

    // LOCKED STATE - Gray with low opacity
    if (!isDesbloqueado) {
      return "bg-gradient-gray-lock border-gray-300 opacity-60 cursor-not-allowed transition-smooth";
    }

    // COMPLETED STATE - Green (same for all completed levels)
    if (isCompletado) {
      // If also current, add turquoise glow accent
      if (isActual) {
        return "bg-gradient-verde border-[#76b57b] shadow-verde ring-2 ring-[#2db3b6]/40 hover:ring-[#2db3b6]/60 hover:shadow-jade-glow cursor-pointer transition-smooth hover:-translate-y-1";
      }
      return "bg-gradient-verde border-[#76b57b] shadow-verde hover:shadow-verde-glow cursor-pointer transition-smooth hover:-translate-y-1";
    }

    // INCOMPLETE + CURRENT - Brown pyramid with turquoise accent
    if (isActual) {
      return "bg-gradient-brown border-[#d4a574] shadow-brown ring-2 ring-[#2db3b6]/40 hover:ring-[#2db3b6]/60 hover:shadow-jade-glow cursor-pointer transition-smooth hover:-translate-y-1";
    }

    // INCOMPLETE + NOT CURRENT - Just brown (pyramid adobe color)
    return "bg-gradient-brown border-[#d4a574] shadow-brown hover:shadow-brown cursor-pointer transition-smooth hover:-translate-y-1";
  };

  const handleNivelClick = (numero: number) => {
    const progreso = progresoNiveles[numero];
    if (!progreso?.desbloqueado) return;

    // Mapear número de nivel a dificultad para el filtro
    const dificultadMap: Record<number, string> = {
      1: "principiante",
      2: "intermedio",
      3: "avanzado",
    };

    // Redirigir a /lecciones con query param de dificultad
    navigate(`/lecciones?dificultad=${dificultadMap[numero]}`);
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-center gap-6">
        {/* NIVEL 3 - Avanzado (Top) */}
        <div
          onClick={() => handleNivelClick(3)}
          className={`w-64 h-32 rounded-xl flex items-center justify-center shadow-md border-2 ${getNivelClass(3)}`}
        >
          <div className="text-center text-obsidiana dark:text-white px-4">
            {progresoNiveles[3]?.desbloqueado ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TriangleUpIcon className="h-6 w-6" />
                  <p className="text-2xl font-bold">Nivel 3</p>
                </div>
                <p className="text-sm font-medium">Avanzado</p>
                {progresoNiveles[3] && (
                  <p className="text-xs opacity-90 mt-1.5">
                    {progresoNiveles[3].leccionesCompletadas}/{progresoNiveles[3].totalLecciones}{" "}
                    lecciones
                  </p>
                )}
              </>
            ) : (
              <>
                <LockClosedIcon className="h-8 w-8 mx-auto mb-2 opacity-75" />
                <p className="text-sm font-medium">Nivel 3 Bloqueado</p>
                <p className="text-xs opacity-60 mt-1">Completa Nivel 2</p>
              </>
            )}
          </div>
        </div>

        {/* NIVEL 2 - Intermedio (Middle) */}
        <div
          onClick={() => handleNivelClick(2)}
          className={`w-80 h-32 rounded-xl flex items-center justify-center shadow-md border-2 ${getNivelClass(2)}`}
        >
          <div className="text-center text-obsidiana dark:text-white px-4">
            {progresoNiveles[2]?.desbloqueado ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TriangleUpIcon className="h-6 w-6" />
                  <p className="text-2xl font-bold">Nivel 2</p>
                </div>
                <p className="text-sm font-medium">Intermedio</p>
                {progresoNiveles[2] && (
                  <p className="text-xs opacity-90 mt-1.5">
                    {progresoNiveles[2].leccionesCompletadas}/{progresoNiveles[2].totalLecciones}{" "}
                    lecciones
                  </p>
                )}
              </>
            ) : (
              <>
                <LockClosedIcon className="h-8 w-8 mx-auto mb-2 opacity-75" />
                <p className="text-sm font-medium">Nivel 2 Bloqueado</p>
                <p className="text-xs opacity-60 mt-1">Completa Nivel 1</p>
              </>
            )}
          </div>
        </div>

        {/* NIVEL 1 - Principiante (Base) */}
        <div className="w-full max-w-2xl">
          <div
            onClick={() => handleNivelClick(1)}
            className={`w-full min-h-32 rounded-xl shadow-md border-2 ${getNivelClass(1)}`}
          >
            <div className="p-6">
              <div className="text-center text-obsidiana dark:text-white mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TriangleUpIcon className="h-6 w-6" />
                  <p className="text-2xl font-bold">Nivel 1 - Principiante</p>
                </div>
                {progresoNiveles[1] && (
                  <>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
                        <div
                          className="progress-jade"
                          style={{
                            width: `${(progresoNiveles[1].leccionesCompletadas / progresoNiveles[1].totalLecciones) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs opacity-90 font-medium">
                        {progresoNiveles[1].leccionesCompletadas}/
                        {progresoNiveles[1].totalLecciones}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Próxima Lección Integrada - Premium card with jade accent */}
              {nivelActualNumero === 1 && proximaLeccion && (
                <Card className="glass-white border-2 border-[#2db3b6]/20 shadow-jade-lg hover:shadow-jade-xl transition-smooth">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <LightningBoltIcon className="h-3.5 w-3.5 text-[#2db3b6]" />
                            <p className="text-xs font-semibold text-gradient-jade uppercase tracking-wide">
                              Tu Próxima Lección
                            </p>
                          </div>
                          <h3 className="font-bold text-lg text-[#161f16] dark:text-white mt-1">
                            Lección {proximaLeccion.numero}: {proximaLeccion.titulo}
                          </h3>
                        </div>
                        <Badge className="bg-gradient-sun-soft text-[#f3b62a] border-[#f3b62a]/30 font-semibold shadow-sm">
                          +{proximaLeccion.tomins} tomins
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {proximaLeccion.descripcion}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <ReaderIcon className="h-3.5 w-3.5" />
                          <span>{proximaLeccion.palabras.length} palabras</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span>~10 min</span>
                        </div>
                      </div>

                      <Button
                        asChild
                        className="w-full bg-gradient-jade hover:shadow-jade-glow text-white shadow-jade-md transition-smooth hover:-translate-y-0.5"
                        size="lg"
                        disabled={vidasDisponibles === 0}
                      >
                        <Link to={`/leccion/${proximaLeccion.id}`}>
                          <RocketIcon className="mr-2 h-5 w-5" />
                          Comenzar Lección
                        </Link>
                      </Button>

                      {vidasDisponibles === 0 && (
                        <p className="text-xs text-red-600 text-center font-medium">
                          Necesitas al menos 1 vida para practicar
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hint para interactividad */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <LightningBoltIcon className="h-4 w-4 text-gray-400" />
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Haz click en un nivel para ver sus lecciones
        </p>
      </div>
    </div>
  );
}
