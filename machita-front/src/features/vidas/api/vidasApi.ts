import { fetchAPI } from "@/lib/api";
import type { EstadoVidas, ResultadoCompra } from "../types";

export const vidasApi = {
  getEstado: async (): Promise<EstadoVidas> => {
    return fetchAPI<EstadoVidas>("/vidas/estado/");
  },

  comprarUna: async (): Promise<ResultadoCompra> => {
    return fetchAPI<ResultadoCompra>("/vidas/comprar/una/", {
      method: "POST",
    });
  },

  restaurarTodas: async (): Promise<ResultadoCompra> => {
    return fetchAPI<ResultadoCompra>("/vidas/comprar/restaurar/", {
      method: "POST",
    });
  },
};
