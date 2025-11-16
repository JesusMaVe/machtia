import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/features/auth";
import { leccionesApi, type Leccion } from "@/features/lecciones";
import { nivelesApi } from "@/features/niveles/api/nivelesApi";
import type { Nivel } from "@/features/niveles/types";
import type { Route } from "./+types/aprende";
import { LoadingButton } from "@/shared/components/atoms";
import { PyramidHero } from "@/features/dashboard/components/PyramidHero";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ReaderIcon } from "@radix-ui/react-icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Aprende Náhuatl - Machtia" },
    { name: "description", content: "Aprende Náhuatl con lecciones interactivas" },
  ];
}

export default function AprendePage() {
  const { user } = useAuth();

  // Estado para próxima lección
  const [proximaLeccion, setProximaLeccion] = useState<Leccion | null>(null);

  // Estado para lecciones y niveles
  const [todasLecciones, setTodasLecciones] = useState<Leccion[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);

  // Estado de carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setIsLoading(true);

        const [leccionesData, nivelesData] = await Promise.all([
          leccionesApi.list().catch(() => []),
          nivelesApi.list().catch(() => []),
        ]);

        setTodasLecciones(leccionesData);
        setNiveles(nivelesData);

        // Calcular próxima lección basada en las lecciones obtenidas
        const primeraIncompleta = leccionesData.find((l) => !l.completada && !l.bloqueada);
        setProximaLeccion(primeraIncompleta || null);
      } catch (err) {
        setError("Error al cargar las lecciones");
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Mapeo de dificultad a número de nivel
  const dificultadToNivel: Record<string, number> = {
    principiante: 1,
    intermedio: 2,
    avanzado: 3,
  };

  // Calcular progreso de niveles
  const progresoNiveles = useMemo(() => {
    const progreso: Record<
      number,
      { leccionesCompletadas: number; totalLecciones: number; desbloqueado: boolean }
    > = {
      1: { leccionesCompletadas: 0, totalLecciones: 0, desbloqueado: true }, // Nivel 1 siempre desbloqueado
      2: { leccionesCompletadas: 0, totalLecciones: 0, desbloqueado: false },
      3: { leccionesCompletadas: 0, totalLecciones: 0, desbloqueado: false },
    };

    // Calcular totales y completadas por nivel
    todasLecciones.forEach((leccion) => {
      const nivelNum = dificultadToNivel[leccion.dificultad] || 1;
      progreso[nivelNum].totalLecciones++;
      if (leccion.completada) {
        progreso[nivelNum].leccionesCompletadas++;
      }
    });

    // Determinar niveles desbloqueados
    // Nivel 2 se desbloquea si Nivel 1 está 100% completado
    if (
      progreso[1].totalLecciones > 0 &&
      progreso[1].leccionesCompletadas === progreso[1].totalLecciones
    ) {
      progreso[2].desbloqueado = true;
    }

    // Nivel 3 se desbloquea si Nivel 2 está 100% completado
    if (
      progreso[2].totalLecciones > 0 &&
      progreso[2].leccionesCompletadas === progreso[2].totalLecciones
    ) {
      progreso[3].desbloqueado = true;
    }

    return progreso;
  }, [todasLecciones]);

  // Determinar nivel actual del usuario
  const nivelActualNumero = useMemo(() => {
    // Si próxima lección existe, determinar su nivel
    if (proximaLeccion) {
      return dificultadToNivel[proximaLeccion.dificultad] || 1;
    }

    // Si no, encontrar el nivel más alto desbloqueado con lecciones incompletas
    for (let i = 3; i >= 1; i--) {
      if (
        progresoNiveles[i].desbloqueado &&
        progresoNiveles[i].leccionesCompletadas < progresoNiveles[i].totalLecciones
      ) {
        return i;
      }
    }

    // Por defecto, nivel 1
    return 1;
  }, [proximaLeccion, progresoNiveles]);

  // Handler para click en niveles de la pirámide
  const handleNivelClick = (nivelNumero: number) => {
    // Llamar a la función global de smooth scroll del acordeón
    if ((window as any).scrollToNivel) {
      (window as any).scrollToNivel(nivelNumero);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingButton isLoading={true} disabled>
          Cargando...
        </LoadingButton>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-red-700 underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Sección de bienvenida */}
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold text-obsidiana dark:text-white">
              ¡Bienvenido, {user.nombre}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Continúa tu aprendizaje de Náhuatl desde donde lo dejaste
            </p>
          </div>

          {/* Pirámide Hero con próxima lección integrada */}
          <PyramidHero
            niveles={niveles}
            nivelActualNumero={nivelActualNumero}
            proximaLeccion={proximaLeccion}
            progresoNiveles={progresoNiveles}
            onNivelClick={handleNivelClick}
            vidasDisponibles={user.vidas}
          />

          {/* CTA para explorar catálogo completo */}
          <div className="text-center py-8">
            <Button
              asChild
              size="lg"
              className="bg-gradient-jade hover:shadow-jade-glow text-white shadow-jade-md transition-smooth hover:-translate-y-0.5"
            >
              <Link to="/lecciones" className="flex items-center gap-2">
                <ReaderIcon className="h-5 w-5" />
                Explorar todas las lecciones
              </Link>
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Navega por el catálogo completo con filtros por dificultad y tema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
