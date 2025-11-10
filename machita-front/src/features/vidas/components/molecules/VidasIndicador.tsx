import { VIDAS_MAXIMAS } from "@/shared/constants";
import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";

interface VidasIndicadorProps {
  vidasActuales: number;
  vidasMaximas?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}

export function VidasIndicador({
  vidasActuales,
  vidasMaximas = VIDAS_MAXIMAS,
  size = "md",
  showNumber = false,
}: VidasIndicadorProps) {
  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const hearts = Array.from({ length: vidasMaximas }, (_, i) => {
    const isLlena = i < vidasActuales;
    return (
      <div key={i} className="inline-block">
        {isLlena ? (
          <HeartFilledIcon className={`${iconSize} text-red-500`} />
        ) : (
          <HeartIcon className={`${iconSize} text-gray-300`} />
        )}
      </div>
    );
  });

  return (
    <div className="flex items-center gap-1">
      {hearts}
      {showNumber && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {vidasActuales}/{vidasMaximas}
        </span>
      )}
    </div>
  );
}
