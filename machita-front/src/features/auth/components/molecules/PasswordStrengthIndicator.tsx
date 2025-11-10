import { Progress } from "@/components/ui/progress";
import { getPasswordStrength } from "@/features/auth/utils/validations";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { strength, score } = getPasswordStrength(password);
  const percentage = (score / 6) * 100;

  const strengthColor = {
    weak: "text-red-500",
    medium: "text-yellow-500",
    strong: "text-green-500",
  };

  const strengthText = {
    weak: "Débil",
    medium: "Media",
    strong: "Fuerte",
  };

  return (
    <div className="space-y-1">
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        Fortaleza: <span className={strengthColor[strength]}>{strengthText[strength]}</span>
      </p>
    </div>
  );
}
