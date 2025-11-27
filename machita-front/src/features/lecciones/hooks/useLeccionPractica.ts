import { useState } from "react";
import type { Leccion, EstadoPractica } from "../types";

interface UseLeccionPracticaProps {
  leccion: Leccion;
  onComplete: () => void;
  onFail: () => void;
}

export function useLeccionPractica({ leccion, onComplete, onFail }: UseLeccionPracticaProps) {
  const [estado, setEstado] = useState<EstadoPractica>({
    leccionId: leccion.id,
    palabraActual: 0,
    totalPalabras: leccion.palabras.length,
    respuestasCorrectas: 0,
    respuestasIncorrectas: 0,
  });

  const [mostrarResultado, setMostrarResultado] = useState(false);

  const palabraActual = leccion.palabras[estado.palabraActual];
  const progreso = ((estado.palabraActual + 1) / estado.totalPalabras) * 100;
  const esFinal = estado.palabraActual === estado.totalPalabras - 1;

  const handleRespuesta = (esCorrecta: boolean) => {
    const nuevoEstado = {
      ...estado,
      respuestasCorrectas: esCorrecta ? estado.respuestasCorrectas + 1 : estado.respuestasCorrectas,
      respuestasIncorrectas: !esCorrecta
        ? estado.respuestasIncorrectas + 1
        : estado.respuestasIncorrectas,
    };

    if (esFinal) {
      const porcentajeAciertos = (nuevoEstado.respuestasCorrectas / estado.totalPalabras) * 100;

      setEstado(nuevoEstado);
      setMostrarResultado(true);

      if (porcentajeAciertos >= 70) {
        onComplete();
      } else {
        onFail();
      }
    } else {
      setEstado({
        ...nuevoEstado,
        palabraActual: estado.palabraActual + 1,
      });
    }
  };

  const reiniciar = () => {
    setEstado({
      leccionId: leccion.id,
      palabraActual: 0,
      totalPalabras: leccion.palabras.length,
      respuestasCorrectas: 0,
      respuestasIncorrectas: 0,
    });
    setMostrarResultado(false);
  };

  return {
    estado,
    mostrarResultado,
    palabraActual,
    progreso,
    handleRespuesta,
    reiniciar,
  };
}
