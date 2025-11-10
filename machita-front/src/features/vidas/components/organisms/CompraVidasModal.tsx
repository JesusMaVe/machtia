import { useState } from "react";
import { vidasApi } from "../../api/vidasApi";
import type { OpcionCompra } from "../../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COSTO_UNA_VIDA, COSTO_RESTAURAR_VIDAS, VIDAS_MAXIMAS } from "@/shared/constants";
import { LoadingButton } from "@/shared/components/atoms";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { Coins } from "lucide-react";

interface CompraVidasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tominsDisponibles: number;
  vidasActuales: number;
  onCompraExitosa: () => void;
}

export function CompraVidasModal({
  open,
  onOpenChange,
  tominsDisponibles,
  vidasActuales,
  onCompraExitosa,
}: CompraVidasModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opciones: OpcionCompra[] = [
    {
      tipo: "una_vida",
      costo: COSTO_UNA_VIDA,
      vidas: 1,
      descripcion: "Recupera una vida",
    },
    {
      tipo: "restaurar_todas",
      costo: COSTO_RESTAURAR_VIDAS,
      vidas: VIDAS_MAXIMAS - vidasActuales,
      descripcion: "Restaura todas tus vidas",
    },
  ];

  const handleCompra = async (tipo: "una_vida" | "restaurar_todas") => {
    try {
      setIsLoading(true);
      setError(null);

      const resultado =
        tipo === "una_vida" ? await vidasApi.comprarUna() : await vidasApi.restaurarTodas();

      if (resultado.exito) {
        onCompraExitosa();
        onOpenChange(false);
      } else {
        setError(resultado.mensaje);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comprar vidas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartFilledIcon className="h-5 w-5 text-red-500" />
            Comprar Vidas
          </DialogTitle>
          <DialogDescription>
            Usa tus tomins para recuperar vidas y seguir aprendiendo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Tomins disponibles</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                {tominsDisponibles}
              </p>
              <Coins className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          {opciones.map((opcion) => {
            const puedeComprar = tominsDisponibles >= opcion.costo;
            const esInnecesario =
              opcion.tipo === "restaurar_todas" && vidasActuales === VIDAS_MAXIMAS;

            return (
              <Card
                key={opcion.tipo}
                className={`${puedeComprar && !esInnecesario ? "border-primary" : "opacity-50"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{opcion.descripcion}</CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200"
                    >
                      {opcion.costo} tomins
                    </Badge>
                  </div>
                  <CardDescription>
                    +{opcion.vidas} {opcion.vidas === 1 ? "vida" : "vidas"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {esInnecesario ? (
                    <Button disabled className="w-full">
                      Ya tienes todas las vidas
                    </Button>
                  ) : (
                    <LoadingButton
                      onClick={() => handleCompra(opcion.tipo)}
                      disabled={!puedeComprar || isLoading}
                      isLoading={isLoading}
                      className="w-full"
                    >
                      {puedeComprar ? "Comprar" : "Tomins insuficientes"}
                    </LoadingButton>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="text-center text-xs text-gray-500 pt-2 border-t">
            Las vidas se regeneran automáticamente cada 30 minutos
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
