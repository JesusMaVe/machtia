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
    // Use neutral brown tones for all difficulty levels - difficulty is informational only
    // Don't use green/yellow/red as those are reserved for completion states
    switch (nivel) {
      case DIFICULTADES.PRINCIPIANTE:
        return "bg-gradient-brown-soft text-[#d4a574] border-[#d4a574]/30";
      case DIFICULTADES.INTERMEDIO:
        return "bg-gradient-brown-soft text-[#c49563] border-[#c49563]/30";
      case DIFICULTADES.AVANZADO:
        return "bg-gradient-brown-soft text-[#b88552] border-[#b88552]/30";
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
