import { useEffect, useState } from "react";
import { ProtectedRoute, useAuth } from "@/features/auth";
import { leccionesApi, type Leccion } from "@/features/lecciones";
import {
  RachaWidget,
  EstadisticasCard,
  progresoApi,
  type Racha,
  type Estadisticas,
} from "@/features/progreso";
import { VidasCard, vidasApi, type EstadoVidas } from "@/features/vidas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { ExitIcon, BookmarkIcon, BarChartIcon, RocketIcon } from "@radix-ui/react-icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Machtia" },
    { name: "description", content: "Tu panel de aprendizaje de Náhuatl" },
  ];
}

function DashboardContent() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [racha, setRacha] = useState<Racha | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [estadoVidas, setEstadoVidas] = useState<EstadoVidas | null>(null);
  const [proximaLeccion, setProximaLeccion] = useState<Leccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);

        const [rachaData, estadisticasData, vidasData, leccionData] = await Promise.all([
          progresoApi.getRacha().catch(() => null),
          progresoApi.getEstadisticas().catch(() => null),
          vidasApi.getEstado().catch(() => null),
          leccionesApi.getNext().catch(() => null),
        ]);

        setRacha(rachaData);
        setEstadisticas(estadisticasData);
        setEstadoVidas(vidasData);
        setProximaLeccion(leccionData);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCompraVidasExitosa = async () => {
    await refreshUser();

    const nuevoEstadoVidas = await vidasApi.getEstado();
    setEstadoVidas(nuevoEstadoVidas);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-tierra">Machtia</h1>
              <Badge variant="outline" className="hidden sm:inline-flex">
                Aprende Náhuatl
              </Badge>
            </div>

            <nav className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/lecciones">
                  <BookmarkIcon className="mr-2 h-4 w-4" />
                  Lecciones
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/progreso">
                  <BarChartIcon className="mr-2 h-4 w-4" />
                  Progreso
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <ExitIcon className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-obsidiana mb-2">¡Bienvenido, {user.nombre}!</h2>
            <p className="text-gray-600">
              Continúa tu aprendizaje de Náhuatl desde donde lo dejaste
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {racha && <RachaWidget racha={racha} />}

              {estadoVidas && (
                <VidasCard
                  vidasActuales={estadoVidas.vidasActuales}
                  proximaVidaEn={estadoVidas.proximaVidaEn}
                  tominsDisponibles={user.tomin}
                  onCompraExitosa={handleCompraVidasExitosa}
                />
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              {proximaLeccion ? (
                <Card className="border-tierra border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <RocketIcon className="h-5 w-5 text-tierra" />
                          Próxima Lección
                        </CardTitle>
                        <CardDescription className="mt-1">
                          ¡Continúa tu aprendizaje!
                        </CardDescription>
                      </div>
                      <Badge className="bg-maiz text-obsidiana">
                        +{proximaLeccion.tomins} tomins
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-obsidiana mb-1">
                          Lección {proximaLeccion.numero}: {proximaLeccion.titulo}
                        </h3>
                        <p className="text-gray-600 text-sm">{proximaLeccion.descripcion}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{proximaLeccion.palabras.length} palabras nuevas</span>
                        <span>•</span>
                        <span>~10 minutos</span>
                      </div>

                      <Button
                        asChild
                        className="w-full bg-tierra hover:bg-tierra-dark"
                        size="lg"
                        disabled={user.vidas === 0}
                      >
                        <Link to={`/lecciones/${proximaLeccion.id}`}>
                          <RocketIcon className="mr-2 h-5 w-5" />
                          Comenzar Lección
                        </Link>
                      </Button>

                      {user.vidas === 0 && (
                        <p className="text-sm text-red-600 text-center">
                          Necesitas al menos 1 vida para practicar
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">
                      {isLoading
                        ? "Cargando próxima lección..."
                        : "No hay lecciones disponibles en este momento"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {estadisticas && <EstadisticasCard estadisticas={estadisticas} />}

              <Card>
                <CardHeader>
                  <CardTitle>Explorar</CardTitle>
                  <CardDescription>Descubre más contenido</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-20">
                    <Link to="/lecciones">
                      <BookmarkIcon className="mr-2 h-5 w-5" />
                      Ver Todas las Lecciones
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20">
                    <Link to="/progreso">
                      <BarChartIcon className="mr-2 h-5 w-5" />
                      Ver Progreso Completo
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
