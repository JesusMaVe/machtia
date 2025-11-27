import { useLoaderData, useNavigate } from "react-router";
import { useAuth } from "@/features/auth";
import { leccionesApi, DynamicaRouter, type Leccion } from "@/features/lecciones";
import { useVidasModal } from "@/features/vidas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { LoadingButton } from "@/shared/components/atoms";
import type { Route } from "./+types/leccion.$leccionId";
import { isRouteErrorResponse } from "react-router";

// Usamos clientLoader porque necesitamos acceder a sessionStorage para el token de autenticación
// y sessionStorage no está disponible en el servidor (SSR).
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (!params.leccionId) {
    throw new Response("ID de lección no válido", { status: 400 });
  }

  try {
    const leccion = await leccionesApi.get(params.leccionId);

    if (leccion.bloqueada) {
      throw new Response("Esta lección aún está bloqueada", { status: 403 });
    }

    return { leccion };
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response("Error al cargar la lección", { status: 500 });
  }
}

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <LoadingButton isLoading={true} disabled>
        Cargando lección...
      </LoadingButton>
    </div>
  );
}

export default function LeccionDetallePage() {
  const { leccion } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { openModal } = useVidasModal();

  // Validación de vidas en el cliente
  if (user && user.vidas === 0 && !leccion.completada) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg border-2 border-red-200 dark:border-red-900">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full">
                <Heart className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              ¡Te has quedado sin vidas!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              No puedes practicar lecciones sin vidas. Espera a que se regeneren o cómpralas con
              tomins.
            </p>
            <div className="space-y-3 pt-4">
              <Button
                onClick={openModal}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold"
              >
                <Heart className="mr-2 h-4 w-4" fill="currentColor" />
                Comprar Vidas
              </Button>
              <Button onClick={() => navigate("/aprende")} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    if (leccion.completada) return;

    try {
      await leccionesApi.complete(leccion.id);
      await refreshUser();
    } catch (err) {}
  };

  const handleFail = async () => {
    if (leccion.completada) return;

    try {
      const resultado = await leccionesApi.fail(leccion.id);
      await refreshUser();

      if (resultado.vidasRestantes === 0) {
        openModal();
      }
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={() => navigate("/aprende")}
          variant="ghost"
          className="mb-6 text-[#d4a574] hover:text-[#c49563] hover:bg-gradient-brown-soft"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>

        <DynamicaRouter leccion={leccion} onComplete={handleComplete} onFail={handleFail} />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const navigate = useNavigate();
  let message = "Error desconocido";

  if (isRouteErrorResponse(error)) {
    message = error.data as string || error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
        <Button
          onClick={() => navigate("/aprende")}
          className="w-full bg-gradient-brown hover:shadow-brown text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
}
