import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { ProtectedRoute, useAuth } from "@/features/auth";
import { leccionesApi, LeccionDetalle, type Leccion } from "@/features/lecciones";
import { LoadingButton } from "@/shared/components/atoms";
import { Button } from "@/components/ui/button";

export default function LeccionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser, updateUser } = useAuth();

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

  const handleBack = () => {
    navigate("/aprende");
  };

  const handleComplete = useCallback(async () => {
    if (!leccion) return;

    try {
      const resultado = await leccionesApi.complete(leccion.id);

      // Actualizar usuario local con vidas y tomins del resultado sin hacer fetch adicional
      if (user && resultado) {
        updateUser((prevUser) => ({
          ...prevUser,
          vidas: resultado.vidasRestantes,
          tomin: prevUser.tomin + resultado.tomins,
        }));
      }
    } catch (err) {}
  }, [leccion, user, updateUser]);

  const handleFail = useCallback(async () => {
    if (!leccion) return;

    try {
      const resultado = await leccionesApi.fail(leccion.id);

      // Actualizar vidas del usuario local sin hacer fetch adicional
      if (user && resultado && typeof resultado.vidasRestantes === "number") {
        updateUser((prevUser) => ({
          ...prevUser,
          vidas: resultado.vidasRestantes,
        }));
      }
    } catch (err) {}
  }, [leccion, user, updateUser]);

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
            <Button onClick={handleBack} variant="ghost" className="flex-1">
              Volver a Aprende
            </Button>
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
