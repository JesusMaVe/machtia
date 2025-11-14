import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/features/auth";
import { leccionesApi, LeccionDetalle, type Leccion } from "@/features/lecciones";
import { LoadingButton } from "@/shared/components/atoms";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LeccionDetallePage() {
  const { leccionId } = useParams<{ leccionId: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setLeccion(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar lección");
      } finally {
        setIsLoading(false);
      }
    };

    cargarLeccion();
  }, [leccionId]);

  const handleComplete = async () => {
    if (!leccion) return;

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

    try {
      const resultado = await leccionesApi.fail(leccion.id);

      await refreshUser();

      if (resultado.vidasRestantes === 0) {
        console.log("Sin vidas:", resultado);
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
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error || "Lección no encontrada"}</p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-tierra hover:bg-tierra-dark"
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
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          className="mb-6 text-tierra hover:text-tierra-dark"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>

        <LeccionDetalle leccion={leccion} onComplete={handleComplete} onFail={handleFail} />
      </div>
    </div>
  );
}
