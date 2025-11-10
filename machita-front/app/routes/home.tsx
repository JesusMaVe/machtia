import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth";
import { Spinner } from "@/components/ui/spinner";
import type { Route } from "./+types/home";

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

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner className="h-8 w-8 mx-auto" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
