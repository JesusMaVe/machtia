import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/features/auth";
import { leccionesApi, LeccionDetalle, type Leccion } from "@/features/lecciones";
import { useVidasModal } from "@/features/vidas";
import { LoadingButton } from "@/shared/components/atoms";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

export default function LeccionDetallePage() {
  const { leccionId } = useParams<{ leccionId: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { openModal } = useVidasModal();

  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: Verificar vidas al cargar
  useEffect(() => {
    const cargarLeccion = async () => {
      if (!leccionId) {
        setError("ID de lección no válido");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await leccionesApi.get(leccionId);

        if (data.bloqueada) {
          setError("Esta lección aún está bloqueada. Completa las lecciones anteriores primero.");
          setIsLoading(false);
          return;
        }

        // Guard: Bloquear solo si NO tiene vidas Y la lección NO está completada
        if (user && user.vidas === 0 && !data.completada) {
          setError("sin_vidas");
          setIsLoading(false);
          return;
        }

        setLeccion(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar lección");
      } finally {
        setIsLoading(false);
      }
    };

    cargarLeccion();
  }, [leccionId, user]);

  const handleComplete = async () => {
    if (!leccion) return;

    // Si la lección ya está completada, no llamar al backend
    if (leccion.completada) {
      console.log("Lección en modo práctica - no se ganan tomins");
      navigate("/aprende");
      return;
    }

    try {
      const resultado = await leccionesApi.complete(leccion.id);

      await refreshUser();

      console.log("Lección completada:", resultado);

      // Redirigir al dashboard después de completar
      navigate("/aprende");
    } catch (err) {
      console.error("Error al completar lección:", err);
    }
  };

  const handleFail = async () => {
    if (!leccion) return;

    // Si la lección ya está completada, no llamar al backend (no perder vidas)
    if (leccion.completada) {
      console.log("Lección en modo práctica - no se pierden vidas");
      return;
    }

    try {
      const resultado = await leccionesApi.fail(leccion.id);

      await refreshUser();

      // Auto-redirect: Si se queda sin vidas, abrir modal
      if (resultado.vidasRestantes === 0) {
        console.log("Sin vidas, abriendo modal:", resultado);
        openModal();
      }
    } catch (err) {
      console.error("Error al registrar fallo:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingButton isLoading={true} disabled>
          Cargando lección...
        </LoadingButton>
      </div>
    );
  }

  if (error || !leccion) {
    // Caso especial: Sin vidas
    if (error === "sin_vidas") {
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

    // Otros errores
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {error || "Lección no encontrada"}
          </p>
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

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón Volver */}
        <Button
          onClick={() => navigate("/aprende")}
          variant="ghost"
          className="mb-6 text-[#d4a574] hover:text-[#c49563] hover:bg-gradient-brown-soft"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>

        <LeccionDetalle leccion={leccion} onComplete={handleComplete} onFail={handleFail} />
      </div>
    </div>
  );
}
