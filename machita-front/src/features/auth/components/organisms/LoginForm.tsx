import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { loginSchema, type LoginFormData } from "../../utils/validations";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { FormField } from "@/shared/components/molecules/FormField";
import { LoadingButton } from "@/shared/components/atoms/LoadingButton";
import { EnvelopeClosedIcon, LockClosedIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface LoginFormProps {
  onSuccess?: () => void;
  showCard?: boolean;
}

export function LoginForm({ onSuccess, showCard = true }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/aprende");
      }
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Error al iniciar sesión",
      });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <Alert variant="destructive" className="mb-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <div className="ml-2">{errors.root.message}</div>
        </Alert>
      )}

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

      <LoadingButton
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        loadingText="Iniciando sesión..."
      >
        Iniciar Sesión
      </LoadingButton>
    </form>
  );

  if (!showCard) {
    return formContent;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tu email y contraseña para acceder
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
