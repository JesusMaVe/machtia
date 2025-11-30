import { useState, useEffect, useCallback } from "react";
import { vidasApi } from "../api/vidasApi";
import type { EstadoVidas } from "../types";
import type { User } from "@/features/auth";

export function useVidas(updateUser?: (updater: (user: User) => User) => void) {
  const [estadoVidas, setEstadoVidas] = useState<EstadoVidas | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState<string | null>(null);
  const [vidaLista, setVidaLista] = useState(false);

  const cargarEstadoVidas = useCallback(async () => {
    try {
      const estado = await vidasApi.getEstado();
      setEstadoVidas(estado);

      // Actualizar el usuario local con las vidas del estado
      if (updateUser) {
        updateUser((user) => ({
          ...user,
          vidas: estado.vidasActuales,
        }));
      }
    } catch (err) {
      console.error("Error al cargar estado de vidas:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sin dependencias - siempre usa la última versión de updateUser del closure

  // Efecto para el temporizador
  useEffect(() => {
    if (!estadoVidas?.regeneracionActiva || !estadoVidas.proximaVidaEnSegundos) {
      setTiempoRestante(null);
      return;
    }

    let segundos = estadoVidas.proximaVidaEnSegundos;

    const actualizarTimer = () => {
      if (segundos <= 0) {
        // Tiempo terminado, habilitar reclamo manual
        setVidaLista(true);
        setTiempoRestante(null);
        return;
      }

      const minutos = Math.floor(segundos / 60);
      const segs = segundos % 60;
      setTiempoRestante(`${minutos}:${segs.toString().padStart(2, "0")}`);
      segundos--;
    };

    // Ejecutar inmediatamente
    actualizarTimer();

    const intervalId = setInterval(actualizarTimer, 1000);

    return () => clearInterval(intervalId);
  }, [estadoVidas]);

  const reclamarVida = useCallback(async () => {
    try {
      // Obtener el estado actualizado de vidas desde el backend
      const estado = await vidasApi.getEstado();
      setEstadoVidas(estado);

      // Actualizar el usuario local con las vidas nuevas sin hacer fetch adicional
      // Esto evita el error CORS y mantiene la app 100% SPA
      if (updateUser) {
        updateUser((user) => ({
          ...user,
          vidas: estado.vidasActuales,
        }));
      }

      setVidaLista(false);
      return true;
    } catch (error) {
      console.error("Error al reclamar vida:", error);
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sin dependencias - siempre usa la última versión de updateUser del closure

  return {
    estadoVidas,
    tiempoRestante,
    cargarEstadoVidas,
    vidaLista,
    reclamarVida,
  };
}
