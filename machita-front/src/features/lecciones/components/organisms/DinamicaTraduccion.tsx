import type { Palabra } from "../../types";
import { PalabraCard } from "../molecules/PalabraCard";
import { Button } from "@/components/ui/button";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

interface DinamicaTraduccionProps {
  palabra: Palabra;
  onRespuesta: (esCorrecta: boolean) => void;
}

export function DinamicaTraduccion({ palabra, onRespuesta }: DinamicaTraduccionProps) {
  return (
    <div className="space-y-8">
      <div className="py-8">
        <PalabraCard palabra={palabra} />
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => onRespuesta(false)}
          variant="outline"
          size="lg"
          className="min-w-[140px] border-[#d4a574]/50 text-[#d4a574] hover:bg-gradient-brown-soft dark:hover:bg-orange-500/10"
        >
          <Cross2Icon className="mr-2 h-5 w-5" />
          No la sé
        </Button>
        <Button
          onClick={() => onRespuesta(true)}
          size="lg"
          className="min-w-[140px] bg-gradient-jade hover:shadow-jade-glow text-white"
        >
          <CheckIcon className="mr-2 h-5 w-5" />
          La aprendí
        </Button>
      </div>
    </div>
  );
}
