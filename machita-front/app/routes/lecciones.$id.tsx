import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ProtectedRoute, useAuth } from "@/features/auth";
import { leccionesApi, LeccionDetalle, type Leccion } from "@/features/lecciones";
import { LoadingButton } from "@/shared/components/atoms";

export default function LeccionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarLeccion = async () => {
      if (!id) {
        setError("ID de lección no válido");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await leccionesApi.get(id);

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
  }, [id]);

  const handleComplete = async () => {
    if (!leccion) return;

    try {
      const resultado = await leccionesApi.complete(leccion.id);

      await refreshUser();

      console.log("Lección completada:", resultado);
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
      <ProtectedRoute>
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <LoadingButton isLoading={true} disabled>
            Cargando lección...
          </LoadingButton>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !leccion) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-4">{error || "Lección no encontrada"}</p>
            <button
              onClick={() => navigate("/aprende")}
              className="w-full bg-gradient-brown hover:shadow-brown text-white px-4 py-2 rounded-lg transition-smooth"
            >
              Volver a Lecciones
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LeccionDetalle leccion={leccion} onComplete={handleComplete} onFail={handleFail} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
