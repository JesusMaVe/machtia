export function PasswordRequirements() {
  return (
    <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded-md">
      <p className="font-medium">La contraseña debe contener:</p>
      <ul className="list-disc list-inside space-y-0.5">
        <li>Mínimo 8 caracteres</li>
        <li>Al menos una letra mayúscula</li>
        <li>Al menos una letra minúscula</li>
        <li>Al menos un número</li>
      </ul>
    </div>
  );
}
