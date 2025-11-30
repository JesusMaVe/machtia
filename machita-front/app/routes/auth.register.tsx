import { authApi } from "@/features/auth/api/authApi";

// Esta ruta solo existe para manejar el action de registro
// No renderiza nada, solo procesa el POST
export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const nombre = formData.get("nombre") as string;
  const password = formData.get("password") as string;

  try {
    const response = await authApi.register({ email, nombre, password });
    // SEGURIDAD: El token ahora viene en cookie httpOnly desde el backend
    // No necesitamos guardar nada en sessionStorage

    return {
      success: true,
      user: response.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al registrar usuario",
    };
  }
}

// Componente vacío - esta ruta solo maneja el action
export default function AuthRegister() {
  return null;
}
