import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VidasIndicador } from "../molecules/VidasIndicador";
import { TimerVida } from "../molecules/TimerVida";
import { CompraVidasModal } from "./CompraVidasModal";
import { VIDAS_MAXIMAS } from "@/shared/constants";

interface VidasCardProps {
  vidasActuales: number;
  proximaVidaEn?: number;
  tominsDisponibles: number;
  onCompraExitosa?: () => void;
}

export function VidasCard({
  vidasActuales,
  proximaVidaEn,
  tominsDisponibles,
  onCompraExitosa,
}: VidasCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const estaCompleto = vidasActuales === VIDAS_MAXIMAS;
  const estaCritico = vidasActuales === 0;

  return (
    <>
      <Card className={estaCritico ? "border-red-500 border-2" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Vidas</span>
            <VidasIndicador vidasActuales={vidasActuales} vidasMaximas={VIDAS_MAXIMAS} size="md" />
          </CardTitle>
          <CardDescription>
            {estaCompleto
              ? "Tienes todas tus vidas"
              : estaCritico
                ? "¡Te has quedado sin vidas!"
                : "Tus vidas se regeneran con el tiempo"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!estaCompleto && proximaVidaEn !== undefined && proximaVidaEn > 0 && (
            <div className="p-3 bg-cream rounded-lg">
              <TimerVida minutosRestantes={proximaVidaEn} />
            </div>
          )}

          {!estaCompleto && (
            <Button
              onClick={() => setModalOpen(true)}
              className="w-full bg-tierra hover:bg-tierra-dark"
              variant={estaCritico ? "default" : "outline"}
            >
              {estaCritico ? "¡Comprar vidas ahora!" : "Comprar vidas con tomins"}
            </Button>
          )}

          {estaCritico && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">
                Necesitas vidas para practicar lecciones. Espera a que se regeneren o cómpralas con
                tomins.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <CompraVidasModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        tominsDisponibles={tominsDisponibles}
        vidasActuales={vidasActuales}
        onCompraExitosa={() => {
          onCompraExitosa?.();
        }}
      />
    </>
  );
}
