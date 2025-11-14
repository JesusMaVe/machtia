import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, AuthModal } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Route } from "./+types/home";
import { Sparkles, Target, TrendingUp, BookOpen } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Machtia - Aprende Náhuatl" },
    {
      name: "description",
      content: "Aprende Náhuatl de forma interactiva con Machtia",
    },
  ];
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("register");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/aprende");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleOpenRegister = () => {
    setAuthModalTab("register");
    setAuthModalOpen(true);
  };

  const handleOpenLogin = () => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 mx-auto border-4 border-tierra border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-maiz/10">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-tierra">Machtia</h1>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  Aprende Náhuatl
                </Badge>
              </div>

              <Button onClick={handleOpenLogin} variant="ghost">
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold text-obsidiana">
                Aprende Náhuatl de Forma <span className="text-tierra">Divertida</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Domina el idioma Náhuatl con lecciones interactivas, gamificación y seguimiento de
                progreso
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleOpenRegister}
                size="lg"
                className="bg-tierra hover:bg-tierra-dark text-white px-8 py-6 text-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Comenzar Gratis
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-tierra transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-tierra/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-tierra" />
                  </div>
                  <h3 className="font-semibold text-lg">Lecciones Interactivas</h3>
                  <p className="text-sm text-muted-foreground">
                    Aprende con lecciones estructuradas y ejercicios prácticos
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-maiz transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-maiz/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Gamificación</h3>
                  <p className="text-sm text-muted-foreground">
                    Gana tomins, mantén rachas y desbloquea logros
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-tierra transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-tierra/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-tierra" />
                  </div>
                  <h3 className="font-semibold text-lg">Sigue tu Progreso</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualiza tu avance con estadísticas detalladas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultTab={authModalTab} />
    </>
  );
}
