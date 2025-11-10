import type { Leccion } from "../../types";
import { NivelDificultadBadge } from "./NivelDificultadBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircledIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { Coins } from "lucide-react";
import { Link } from "react-router";

interface LeccionCardProps {
  leccion: Leccion;
}

export function LeccionCard({ leccion }: LeccionCardProps) {
  const { id, numero, titulo, descripcion, dificultad, palabras, tomins, completada, bloqueada } =
    leccion;

  return (
    <Link to={bloqueada ? "#" : `/lecciones/${id}`} className="block">
      <Card
        className={`
          h-full transition-all hover:shadow-md
          ${completada ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/20" : ""}
          ${bloqueada ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary"}
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base flex items-center gap-2">
                <span>Lección {numero}</span>
                {completada && (
                  <CheckCircledIcon className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                )}
                {bloqueada && <LockClosedIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-1">{titulo}</CardDescription>
            </div>
            <NivelDificultadBadge dificultad={dificultad} size="sm" />
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{descripcion}</p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{palabras.length} palabras</span>
              <Badge
                variant="outline"
                className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              >
                <Coins className="h-3 w-3 mr-1" />+{tomins}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
