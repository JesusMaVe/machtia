import { Outlet, NavLink, useNavigate, Navigate } from "react-router";
import { useAuth } from "@/features/auth";
import { FloatingSidebar } from "@/shared/components/organisms";
import { NavigationProgressBar } from "@/shared/components/atoms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { progresoApi, type Racha } from "@/features/progreso";
import { useTheme } from "@/shared/context";
import { CompraVidasModal, useVidasModal, useVidas } from "@/features/vidas";
import { toast } from "sonner";

export default function AppLayout() {
  const { user, isAuthenticated, logout, isLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isOpen, closeModal } = useVidasModal();
  const [racha, setRacha] = useState<Racha | null>(null);
  const { estadoVidas, tiempoRestante, cargarEstadoVidas, vidaLista, reclamarVida } =
    useVidas(updateUser);

  // Cargar racha
  useEffect(() => {
    const cargarRacha = async () => {
      try {
        const rachaData = await progresoApi.getRacha().catch(() => null);
        setRacha(rachaData);
      } catch (err) {}
    };

    if (isAuthenticated) {
      cargarRacha();
    }
  }, [isAuthenticated]);

  // Cargar estado de vidas
  useEffect(() => {
    if (isAuthenticated) {
      cargarEstadoVidas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Solo cargar cuando cambia autenticación

  // Notificación para reclamar vida
  useEffect(() => {
    if (vidaLista) {
      toast("¡Tienes una vida regenerada!", {
        description: "Haz click para reclamarla y seguir aprendiendo.",
        action: {
          label: "Reclamar",
          onClick: () => reclamarVida(),
        },
        duration: Infinity, // Mantener hasta que el usuario interactúe
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vidaLista]); // Solo mostrar toast cuando vidaLista cambia

  const handleCompraExitosa = async () => {
    // CompraVidasModal ya actualizó el usuario con updateUser
    // No necesitamos hacer nada más aquí para evitar doble actualización
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

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-nahuatl">
      {/* Barra de progreso global durante navegación */}
      <NavigationProgressBar />

      {/* Header persistente - Premium glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-[rgba(45,179,182,0.1)] glass-white shadow-jade-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo with gradient text */}
            <NavLink
              to="/aprende"
              className="flex items-center gap-3 text-2xl font-bold text-gradient-jade hover-scale transition-smooth"
            >
              Machtia
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-[#2db3b6] text-[#2db3b6]"
              >
                Aprende Náhuatl
              </Badge>
            </NavLink>

            {/* Navigation Links with jade accent */}
            <div className="flex items-center gap-6">
              <NavLink
                to="/aprende"
                className={({ isActive }) =>
                  `text-sm font-medium transition-smooth hover:text-[#2db3b6] ${
                    isActive ? "text-[#2db3b6] font-semibold" : "text-gray-600 dark:text-gray-300"
                  }`
                }
              >
                Aprende
              </NavLink>
              <NavLink
                to="/lecciones"
                className={({ isActive }) =>
                  `text-sm font-medium transition-smooth hover:text-[#2db3b6] ${
                    isActive ? "text-[#2db3b6] font-semibold" : "text-gray-600 dark:text-gray-300"
                  }`
                }
              >
                Lecciones
              </NavLink>
              <NavLink
                to="/progreso"
                className={({ isActive }) =>
                  `text-sm font-medium transition-smooth hover:text-[#2db3b6] ${
                    isActive ? "text-[#2db3b6] font-semibold" : "text-gray-600 dark:text-gray-300"
                  }`
                }
              >
                Mi Progreso
              </NavLink>

              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-full transition-smooth hover:bg-[#2db3b6]/10"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </Button>
            </div>

            {/* User Menu with jade gradient */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale">
                  <Avatar className="h-10 w-10 border-2 border-[#2db3b6]">
                    <AvatarFallback className="bg-gradient-jade text-white font-semibold">
                      {user ? getInitials(user.nombre) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.nombre}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      {/* Sidebar flotante con gamificación */}
      {user && (
        <FloatingSidebar
          vidas={user.vidas}
          tomins={user.tomin}
          racha={racha?.diasActuales || 0}
          tiempoRestante={tiempoRestante}
        />
      )}

      {/* Modal de vidas - Controlado por URL params */}
      {user && (
        <CompraVidasModal
          open={isOpen}
          onOpenChange={closeModal}
          vidasActuales={user.vidas}
          tominsDisponibles={user.tomin}
          onCompraExitosa={handleCompraExitosa}
          updateUser={updateUser}
        />
      )}

      {/* Contenido principal */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
