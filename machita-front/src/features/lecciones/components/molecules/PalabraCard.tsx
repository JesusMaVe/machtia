import type { Palabra } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "@/shared/components/atoms/AudioPlayer";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PalabraCardProps {
  palabra: Palabra;
  showTranslation?: boolean;
  onFlip?: () => void;
}

export function PalabraCard({ palabra, showTranslation = false, onFlip }: PalabraCardProps) {
  const [isFlipped, setIsFlipped] = useState(showTranslation);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Náhuatl</p>
            <h2 className="text-4xl font-bold text-tierra dark:text-orange-400 mb-3">
              {palabra.nahuatl}
            </h2>
            <AudioPlayer audioUrl={palabra.audio} size="md" variant="outline" />
          </div>

          {isFlipped && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 animate-in fade-in duration-200">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Español</p>
              <p className="text-2xl font-semibold text-obsidiana dark:text-white">
                {palabra.espanol}
              </p>
              {palabra.ejemplo && (
                <p className="text-sm text-gray-600 dark:text-gray-300 italic mt-3">
                  "{palabra.ejemplo}"
                </p>
              )}
              {palabra.categoria && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Categoría: {palabra.categoria}
                </p>
              )}
            </div>
          )}

          {!showTranslation && (
            <Button variant="outline" onClick={handleFlip} className="w-full mt-4">
              {isFlipped ? "Ocultar traducción" : "Ver traducción"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
