import { vidasApi } from "@/features/vidas/api/vidasApi";

// Ruta para manejar la compra de vidas
export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const tipo = formData.get("tipo") as "una_vida" | "restaurar_todas";

  try {
    const resultado =
      tipo === "una_vida"
        ? await vidasApi.comprarUna()
        : await vidasApi.restaurarTodas();

    return {
      success: resultado.exito,
      vidasNuevas: resultado.vidasNuevas,
      tominsRestantes: resultado.tominsRestantes,
      mensaje: resultado.mensaje,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al comprar vidas",
    };
  }
}

// Componente vacío - esta ruta solo maneja el action
export default function VidasComprar() {
  return null;
}
