import { useState, useRef, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { LeccionesGrid } from "@/features/lecciones";
import type { Leccion, Tema } from "@/features/lecciones/types";
import type { Nivel } from "@/features/niveles/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NivelesAccordionProps {
  niveles: Nivel[];
  nivelActualNumero: number;
  todasLecciones: Leccion[];
  leccionesPorNivel: Record<number, Leccion[]>;
  progresoNiveles: Record<
    number,
    { leccionesCompletadas: number; totalLecciones: number; desbloqueado: boolean }
  >;
}

export function NivelesAccordion({
  niveles,
  nivelActualNumero,
  todasLecciones,
  leccionesPorNivel,
  progresoNiveles,
}: NivelesAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([`nivel-${nivelActualNumero}`]);
  const [filtrosTema, setFiltrosTema] = useState<Record<number, Tema | "todos">>({});
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Exponer función para scroll desde fuera (será llamada por PyramidHero)
  useEffect(() => {
    // Guardar referencia global para smooth scroll
    (window as any).scrollToNivel = (nivelNumero: number) => {
      const element = sectionRefs.current[nivelNumero];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        // Expandir acordeón después del scroll
        setTimeout(() => {
          setOpenItems((prev) => {
            if (!prev.includes(`nivel-${nivelNumero}`)) {
              return [...prev, `nivel-${nivelNumero}`];
            }
            return prev;
          });
        }, 500);
      }
    };
  }, []);

  const getLeccionesFiltradas = (nivelNumero: number): Leccion[] => {
    const lecciones = leccionesPorNivel[nivelNumero] || [];
    const filtroTema = filtrosTema[nivelNumero];

    if (!filtroTema || filtroTema === "todos") {
      return lecciones;
    }

    return lecciones.filter((l) => l.tema === filtroTema);
  };

  const getTemasDisponibles = (nivelNumero: number): string[] => {
    const lecciones = leccionesPorNivel[nivelNumero] || [];
    const temas = new Set<string>();
    lecciones.forEach((l) => {
      if (l.tema) {
        temas.add(l.tema);
      }
    });
    return Array.from(temas).sort();
  };

  const handleFiltroTemaChange = (nivelNumero: number, tema: string) => {
    setFiltrosTema((prev) => ({
      ...prev,
      [nivelNumero]: tema as Tema | "todos",
    }));
  };

  const limpiarFiltro = (nivelNumero: number) => {
    setFiltrosTema((prev) => ({
      ...prev,
      [nivelNumero]: "todos",
    }));
  };

  return (
    <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-4">
      {niveles
        .sort((a, b) => a.numero - b.numero)
        .map((nivel) => {
          const progreso = progresoNiveles[nivel.numero];
          const isDesbloqueado = progreso?.desbloqueado;
          const isActual = nivel.numero === nivelActualNumero;
          const leccionesFiltradas = getLeccionesFiltradas(nivel.numero);
          const temasDisponibles = getTemasDisponibles(nivel.numero);
          const porcentaje = progreso
            ? Math.round((progreso.leccionesCompletadas / progreso.totalLecciones) * 100)
            : 0;

          return (
            <AccordionItem
              key={nivel.id}
              value={`nivel-${nivel.numero}`}
              className={`border-2 rounded-lg transition-smooth ${
                !isDesbloqueado
                  ? "border-gray-200 bg-white shadow-sm"
                  : porcentaje === 100
                    ? isActual
                      ? "border-[#76b57b] bg-gradient-verde-soft shadow-verde ring-2 ring-[#2db3b6]/30 hover:shadow-jade-glow"
                      : "border-[#76b57b] bg-gradient-verde-soft shadow-sm hover:shadow-verde"
                    : isActual
                      ? "border-[#d4a574] bg-gradient-brown-soft shadow-brown ring-2 ring-[#2db3b6]/30 hover:shadow-jade-glow"
                      : "border-[#d4a574]/30 bg-white shadow-sm hover:shadow-brown"
              }`}
              ref={(el) => {
                sectionRefs.current[nivel.numero] = el;
              }}
            >
              <AccordionTrigger
                className={`px-6 hover:no-underline transition-smooth ${
                  !isDesbloqueado ? "cursor-not-allowed opacity-60" : ""
                }`}
                disabled={!isDesbloqueado}
              >
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    {!isDesbloqueado && <LockClosedIcon className="h-5 w-5 text-gray-400" />}
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-obsidiana dark:text-white">
                        Nivel {nivel.numero} - {nivel.titulo}
                      </h3>
                      {isDesbloqueado && progreso && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {progreso.leccionesCompletadas}/{progreso.totalLecciones} lecciones •{" "}
                          {porcentaje}% completado
                        </p>
                      )}
                      {!isDesbloqueado && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Completa Nivel {nivel.numero - 1} para desbloquear
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActual && (
                      <Badge className="bg-gradient-jade text-white border-[#2db3b6] shadow-jade-sm">
                        Nivel Actual
                      </Badge>
                    )}
                    {isDesbloqueado && porcentaje === 100 && (
                      <Badge className="bg-gradient-verde text-white border-[#76b57b] shadow-verde">
                        ✓ Completado
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              {isDesbloqueado && (
                <AccordionContent className="px-6 pb-6 pt-4">
                  {/* Filtros */}
                  {temasDisponibles.length > 0 && (
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por tema:</span>
                      <Select
                        value={filtrosTema[nivel.numero] || "todos"}
                        onValueChange={(value) => handleFiltroTemaChange(nivel.numero, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Todos los temas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los temas</SelectItem>
                          {temasDisponibles.map((tema) => (
                            <SelectItem key={tema} value={tema}>
                              {tema}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filtrosTema[nivel.numero] && filtrosTema[nivel.numero] !== "todos" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => limpiarFiltro(nivel.numero)}
                        >
                          Limpiar
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Grid de lecciones */}
                  {leccionesFiltradas.length > 0 ? (
                    <LeccionesGrid lecciones={leccionesFiltradas} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No hay lecciones disponibles con este filtro</p>
                      <Button
                        onClick={() => limpiarFiltro(nivel.numero)}
                        variant="link"
                        className="mt-2"
                      >
                        Limpiar filtro
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              )}
            </AccordionItem>
          );
        })}
    </Accordion>
  );
}
