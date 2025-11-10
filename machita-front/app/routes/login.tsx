import { LoginForm, AuthPageLayout } from "@/features/auth";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Iniciar Sesión - Machtia" },
    {
      name: "description",
      content: "Inicia sesión en Machtia para aprender Náhuatl",
    },
  ];
}

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
