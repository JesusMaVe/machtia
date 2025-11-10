import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormError } from "../atoms/FormError";
import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export function FormField({ label, error, icon, id, ...props }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-3 text-muted-foreground">{icon}</div>}
        <Input
          id={id}
          className={icon ? "pl-9" : ""}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <div id={`${id}-error`} role="alert">
          <FormError message={error} />
        </div>
      )}
    </div>
  );
}
