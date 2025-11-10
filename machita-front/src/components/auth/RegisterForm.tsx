import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router";
import { registerSchema, type RegisterFormData, getPasswordStrength } from "@/lib/validations";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { Spinner } from "@/components/ui/spinner";

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
  const passwordStrength = password ? getPasswordStrength(password) : null;

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

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStrengthPercentage = (score: number) => {
    return (score / 6) * 100;
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

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <div className="relative">
              <PersonIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                className="pl-9"
                {...register("nombre")}
                disabled={isSubmitting}
              />
            </div>
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <EnvelopeClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-9"
                {...register("email")}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                {...register("password")}
                disabled={isSubmitting}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}

            {password && passwordStrength && (
              <div className="space-y-1">
                <Progress
                  value={getStrengthPercentage(passwordStrength.score)}
                  className={`h-2 ${getStrengthColor(passwordStrength.strength)}`}
                />
                <p className="text-xs text-muted-foreground">
                  Fortaleza:{" "}
                  <span
                    className={
                      passwordStrength.strength === "weak"
                        ? "text-red-500"
                        : passwordStrength.strength === "medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                    }
                  >
                    {passwordStrength.strength === "weak"
                      ? "Débil"
                      : passwordStrength.strength === "medium"
                        ? "Media"
                        : "Fuerte"}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <CheckCircledIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                {...register("confirmPassword")}
                disabled={isSubmitting}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded-md">
            <p className="font-medium">La contraseña debe contener:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Mínimo 8 caracteres</li>
              <li>Al menos una letra mayúscula</li>
              <li>Al menos una letra minúscula</li>
              <li>Al menos un número</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Registrando...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </Button>
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
