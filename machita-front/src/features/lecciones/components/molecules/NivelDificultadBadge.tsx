import type { Dificultad } from "@/shared/constants";
import { DIFICULTADES } from "@/shared/constants";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

interface NivelDificultadBadgeProps {
  dificultad: Dificultad;
  size?: "sm" | "md" | "lg";
}

export function NivelDificultadBadge({ dificultad, size = "md" }: NivelDificultadBadgeProps) {
  const getColorClass = (nivel: Dificultad): string => {
    switch (nivel) {
      case DIFICULTADES.PRINCIPIANTE:
        return "bg-verde-suave/30 text-verde-suave border-verde-suave/40 hover:bg-verde-suave/40";
      case DIFICULTADES.INTERMEDIO:
        return "bg-tierra/30 text-tierra-dark border-tierra/40 hover:bg-tierra/40";
      case DIFICULTADES.AVANZADO:
        return "bg-verde-amarillo/30 text-verde-amarillo border-verde-amarillo/40 hover:bg-verde-amarillo/40";
      default:
        return "bg-gray-200 text-gray-600 border-gray-300";
    }
  };

  const getLabel = (nivel: Dificultad): string => {
    switch (nivel) {
      case DIFICULTADES.PRINCIPIANTE:
        return "Principiante";
      case DIFICULTADES.INTERMEDIO:
        return "Intermedio";
      case DIFICULTADES.AVANZADO:
        return "Avanzado";
      default:
        return nivel;
    }
  };

  const iconSize = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  }[size];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  }[size];

  return (
    <Badge
      className={`${getColorClass(dificultad)} ${sizeClasses} font-medium flex items-center gap-1`}
    >
      <Circle className={iconSize} fill="currentColor" />
      {getLabel(dificultad)}
    </Badge>
  );
}
