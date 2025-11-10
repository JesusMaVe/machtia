import type { Racha } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRachaColor } from "@/shared/styles/theme";
import { MENSAJES_RACHA } from "@/shared/constants";
import { Flame, AlertTriangle, HeartCrack, Sparkles } from "lucide-react";

interface RachaWidgetProps {
  racha: Racha;
}

export function RachaWidget({ racha }: RachaWidgetProps) {
  const colorClass = getRachaColor(racha.estado);

  const getIcon = () => {
    const iconProps = { className: "h-6 w-6", style: { color: colorClass } };
    switch (racha.estado) {
      case "activa":
        return <Flame {...iconProps} />;
      case "en_riesgo":
        return <AlertTriangle {...iconProps} />;
      case "perdida":
        return <HeartCrack {...iconProps} />;
      default:
        return <Sparkles {...iconProps} />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          <span className="text-lg">Racha de Estudio</span>
        </CardTitle>
        <CardDescription>{MENSAJES_RACHA[racha.estado]}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-5xl font-bold" style={{ color: colorClass }}>
            {racha.diasActuales}
          </span>
          <span className="text-xl text-gray-600">{racha.diasActuales === 1 ? "día" : "días"}</span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Racha máxima:</span>
            <span className="font-semibold">{racha.diasMaximos} días</span>
          </div>
          {racha.proximaExpiracion && racha.estado === "en_riesgo" && (
            <div className="flex justify-between text-amber-600">
              <span>Expira en:</span>
              <span className="font-semibold">
                {new Date(racha.proximaExpiracion).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
