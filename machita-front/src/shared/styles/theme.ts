export const getDificultadColor = (dificultad: "principiante" | "intermedio" | "avanzado") => {
  const colors = {
    principiante: "text-green-600 dark:text-green-400",
    intermedio: "text-amber-600 dark:text-amber-400",
    avanzado: "text-red-600 dark:text-red-400",
  };
  return colors[dificultad];
};

export const getRachaColor = (estado: "nueva" | "activa" | "en_riesgo" | "perdida") => {
  const colors = {
    nueva: "hsl(var(--muted-foreground))",
    activa: "hsl(var(--primary))",
    en_riesgo: "hsl(var(--warning) / 0.8)",
    perdida: "hsl(var(--muted-foreground) / 0.6)",
  };
  return colors[estado];
};
