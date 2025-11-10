import type { Logro } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircledIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { GraduationCap, Flame, Trophy, BookOpen, Medal, Coins, Gem } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Flame,
  Trophy,
  BookOpen,
  Medal,
  Coins,
  Gem,
};

interface LogroCardProps {
  logro: Logro;
}

export function LogroCard({ logro }: LogroCardProps) {
  const { nombre, descripcion, icono, requisito, desbloqueado, fechaDesbloqueo } = logro;

  const IconComponent = iconMap[icono] || Coins; // Fallback a Coins si no existe

  return (
    <Card
      className={`${desbloqueado ? "border-green-600 bg-green-50 dark:bg-green-950/20" : "opacity-60"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="text-amber-600 dark:text-amber-400">
            <IconComponent className="h-10 w-10" />
          </div>
          {desbloqueado ? (
            <CheckCircledIcon className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <LockClosedIcon className="h-5 w-5 text-gray-400 shrink-0" />
          )}
        </div>
        <CardTitle className="text-base">{nombre}</CardTitle>
        <CardDescription className="text-sm">{descripcion}</CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            {requisito}
          </Badge>
          {desbloqueado && fechaDesbloqueo && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              Desbloqueado el{" "}
              {new Date(fechaDesbloqueo).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
