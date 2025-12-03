import { Heart, Coins, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useVidasModal } from "@/features/vidas";
import { useState, useEffect } from "react";

interface FloatingSidebarProps {
  vidas: number;
  tomins: number;
  racha?: number;
  tiempoRestante?: string | null;
}

export function FloatingSidebar({
  vidas,
  tomins,
  racha = 0,
  tiempoRestante,
}: FloatingSidebarProps) {
  const { openModal } = useVidasModal();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar cambios en el tamaño de la pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Desktop: Sidebar flotante a la derecha */}
      <aside className="fixed right-4 top-20 z-40 hidden lg:block">
        <Card className="p-4 space-y-3 shadow-jade-lg border-2 border-[#2db3b6]/20 glass-white dark:bg-dark-bg-elevated">
          <TooltipProvider>
            {/* Vidas - Con botón para comprar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openModal}
                  className="w-full justify-between gap-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors p-2 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    <span className="font-semibold text-lg text-obsidiana dark:text-gray-100">
                      {vidas}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">/ 5</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-sm font-medium">Vidas disponibles</p>
                <p className="text-xs text-muted-foreground">
                  {tiempoRestante
                    ? `Próxima vida en: ${tiempoRestante}`
                    : "Se regeneran cada 5 minutos"}
                </p>
                <p className="text-xs text-[#2db3b6] mt-1">Click para comprar vidas</p>
              </TooltipContent>
            </Tooltip>

            <Separator />

            {/* Tomins - Gold gradient */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default">
                  <Coins className="h-5 w-5 text-[#f3b62a]" />
                  <span className="font-semibold text-lg text-gradient-sun">{tomins}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-sm">Tomins acumulados</p>
                <p className="text-xs text-muted-foreground">Gana más completando lecciones</p>
              </TooltipContent>
            </Tooltip>

            {racha > 0 && (
              <>
                <Separator />

                {/* Racha */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-default">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-lg text-obsidiana dark:text-gray-100">
                          {racha}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {racha === 1 ? "día" : "días"}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-sm">Racha actual</p>
                    <p className="text-xs text-muted-foreground">
                      ¡Sigue estudiando para mantenerla!
                    </p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </Card>
      </aside>

      {/* Mobile & Tablet: Barra inferior fija (Bottom Navigation Pattern) */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-area-bottom">
        <Card className="rounded-none rounded-t-2xl border-t-2 border-[#2db3b6]/20 glass-white dark:bg-dark-bg-elevated shadow-jade-lg">
          <div className="px-4 py-3 max-w-3xl mx-auto">
            <TooltipProvider>
              <div className="flex items-center justify-around gap-2">
                {/* Vidas - Diseño compacto con touch target mínimo 44x44px */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openModal}
                      className="flex-1 min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors touch-manipulation active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-base text-obsidiana dark:text-gray-100">
                            {vidas}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                            / 5
                          </span>
                        </div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-sm font-medium">Vidas disponibles</p>
                    <p className="text-xs text-muted-foreground">
                      {tiempoRestante
                        ? `Próxima vida en: ${tiempoRestante}`
                        : "Se regeneran cada 5 minutos"}
                    </p>
                    <p className="text-xs text-[#2db3b6] mt-1">Toca para comprar vidas</p>
                  </TooltipContent>
                </Tooltip>

                {/* Separador vertical sutil */}
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />

                {/* Tomins - Diseño compacto */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1 min-h-[44px] flex items-center justify-center gap-2 cursor-default">
                      <Coins className="h-6 w-6 text-[#f3b62a]" />
                      <span className="font-semibold text-base text-gradient-sun">{tomins}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-sm">Tomins acumulados</p>
                    <p className="text-xs text-muted-foreground">Gana más completando lecciones</p>
                  </TooltipContent>
                </Tooltip>

                {racha > 0 && (
                  <>
                    {/* Separador vertical sutil */}
                    <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />

                    {/* Racha - Diseño compacto */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 min-h-[44px] flex items-center justify-center gap-2 cursor-default">
                          <Flame className="h-6 w-6 text-orange-500" />
                          <div className="flex flex-col items-start">
                            <span className="font-semibold text-base text-obsidiana dark:text-gray-100 leading-none">
                              {racha}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                              {racha === 1 ? "día" : "días"}
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-sm">Racha actual</p>
                        <p className="text-xs text-muted-foreground">
                          ¡Sigue estudiando para mantenerla!
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
        </Card>
      </aside>
    </>
  );
}
