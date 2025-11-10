import { RegisterForm, AuthPageLayout } from "@/features/auth";
import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crear Cuenta - Machtia" },
    {
      name: "description",
      content: "Crea tu cuenta en Machtia y comienza a aprender Náhuatl",
    },
  ];
}

export default function RegisterPage() {
  return (
    <AuthPageLayout>
      <RegisterForm />
    </AuthPageLayout>
  );
}
