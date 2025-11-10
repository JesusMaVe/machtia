import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router";
import { registerSchema, type RegisterFormData } from "../../utils/validations";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/shared/components/molecules/FormField";
import { LoadingButton } from "@/shared/components/atoms/LoadingButton";
import { PasswordStrengthIndicator } from "../molecules/PasswordStrengthIndicator";
import { PasswordRequirements } from "../molecules/PasswordRequirements";
import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      nombre: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { confirmPassword, ...credentials } = data;
      await registerUser(credentials);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
        <CardDescription className="text-center">
          Completa los datos para registrarte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <div className="ml-2">{error}</div>
            </Alert>
          )}

          <FormField
            id="nombre"
            label="Nombre"
            type="text"
            placeholder="Tu nombre"
            icon={<PersonIcon className="h-4 w-4" />}
            error={errors.nombre?.message}
            disabled={isSubmitting}
            {...register("nombre")}
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="tu@email.com"
            icon={<EnvelopeClosedIcon className="h-4 w-4" />}
            error={errors.email?.message}
            disabled={isSubmitting}
            {...register("email")}
          />

          <div className="space-y-2">
            <FormField
              id="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              icon={<LockClosedIcon className="h-4 w-4" />}
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register("password")}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <FormField
            id="confirmPassword"
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••"
            icon={<CheckCircledIcon className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />

          <PasswordRequirements />

          <LoadingButton
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            loadingText="Registrando..."
          >
            Crear Cuenta
          </LoadingButton>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
