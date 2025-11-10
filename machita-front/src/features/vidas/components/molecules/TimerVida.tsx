import { useEffect, useState } from "react";
import { ClockIcon } from "@radix-ui/react-icons";

interface TimerVidaProps {
  minutosRestantes: number;
}

export function TimerVida({ minutosRestantes: minutosInicial }: TimerVidaProps) {
  const [segundosRestantes, setSegundosRestantes] = useState(minutosInicial * 60);

  useEffect(() => {
    setSegundosRestantes(minutosInicial * 60);
  }, [minutosInicial]);

  useEffect(() => {
    if (segundosRestantes <= 0) return;

    const interval = setInterval(() => {
      setSegundosRestantes((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [segundosRestantes]);

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;

  const formatear = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <ClockIcon className="h-4 w-4" />
      <span>
        Próxima vida en:{" "}
        <span className="font-mono font-semibold text-tierra">
          {formatear(minutos)}:{formatear(segundos)}
        </span>
      </span>
    </div>
  );
}
