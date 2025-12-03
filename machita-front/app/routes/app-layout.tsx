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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { User, LogOut, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

      {/* Header persistente - Premium glassmorphism - Mobile First Responsive */}
      <header className="sticky top-0 z-50 border-b border-[rgba(45,179,182,0.1)] glass-white shadow-jade-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo with gradient text - Responsive sizing */}
            <NavLink
              to="/aprende"
              className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold text-gradient-jade hover-scale transition-smooth flex-shrink-0"
            >
              Machtia
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-[#2db3b6] text-[#2db3b6] text-xs"
              >
                Aprende Náhuatl
              </Badge>
            </NavLink>

            {/* Desktop Navigation - Hidden on mobile/tablet */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
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

              {/* Theme Toggle Button - Desktop */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-full transition-smooth hover:bg-[#2db3b6]/10"
                aria-label="Cambiar tema"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </Button>

              {/* User Menu - Desktop */}
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

            {/* Mobile & Tablet Navigation - Sheet with hamburger menu */}
            <div className="flex md:hidden items-center gap-2">
              {/* Theme Toggle - Mobile (visible always) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-11 w-11 rounded-full transition-smooth hover:bg-[#2db3b6]/10 touch-manipulation active:scale-95"
                aria-label="Cambiar tema"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </Button>

              {/* Mobile Menu Sheet */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-full transition-smooth hover:bg-[#2db3b6]/10 touch-manipulation active:scale-95"
                    aria-label="Abrir menú"
                  >
                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[85vw] sm:w-[350px] glass-white dark:bg-dark-bg-elevated"
                >
                  <SheetHeader className="border-b border-[#2db3b6]/20 pb-4 px px-6">
                    <SheetTitle className="text-gradient-jade text-xl font-bold">
                      Navegación
                    </SheetTitle>
                    <SheetDescription>Menú de navegación y opciones de usuario.</SheetDescription>
                  </SheetHeader>

                  {/* User Info Section - Mobile */}
                  <div className="py-8 border-b border-[#2db3b6]/20 px-6 mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-[#2db3b6]">
                        <AvatarFallback className="bg-gradient-jade text-white font-semibold text-lg">
                          {user ? getInitials(user.nombre) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 flex-1 min-w-0">
                        <p className="text-base font-semibold leading-none text-obsidiana dark:text-gray-100">
                          {user?.nombre}
                        </p>
                        <p className="text-sm leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links - Mobile with touch-friendly targets */}
                  <nav className="flex flex-col gap-6 py-2 px-4">
                    <NavLink
                      to="/aprende"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-4 rounded-lg min-h-[56px] text-base font-medium transition-smooth touch-manipulation active:scale-98 ${
                          isActive
                            ? "bg-[#2db3b6]/10 text-[#2db3b6] font-semibold"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`
                      }
                    >
                      Aprende
                    </NavLink>
                    <NavLink
                      to="/lecciones"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-4 rounded-lg min-h-[56px] text-base font-medium transition-smooth touch-manipulation active:scale-98 ${
                          isActive
                            ? "bg-[#2db3b6]/10 text-[#2db3b6] font-semibold"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`
                      }
                    >
                      Lecciones
                    </NavLink>
                    <NavLink
                      to="/progreso"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-4 rounded-lg min-h-[56px] text-base font-medium transition-smooth touch-manipulation active:scale-98 ${
                          isActive
                            ? "bg-[#2db3b6]/10 text-[#2db3b6] font-semibold"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`
                      }
                    >
                      Mi Progreso
                    </NavLink>
                  </nav>

                  {/* Logout Button - Mobile with touch-friendly target */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full min-h-[56px] border-[#2db3b6] text-[#2db3b6] hover:bg-[#2db3b6]/10 touch-manipulation active:scale-98 text-base font-medium"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
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
      <main className="pb-20 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
