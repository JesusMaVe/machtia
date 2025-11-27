import { AuthPageLayout, LoginForm } from "@/features/auth";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Iniciar Sesión - Machtia" },
    { name: "description", content: "Inicia sesión en Machtia para continuar tu aprendizaje." },
  ];
}

export default function Login() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
