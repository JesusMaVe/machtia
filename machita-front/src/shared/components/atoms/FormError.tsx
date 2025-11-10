import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-destructive">
      <ExclamationTriangleIcon className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
