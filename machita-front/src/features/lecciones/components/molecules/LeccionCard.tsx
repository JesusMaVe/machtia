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
    <Link to={bloqueada ? "#" : `/leccion/${id}`} className="block">
      <Card
        className={`
          h-full transition-smooth
          ${completada ? "border-[#76b57b]/30 bg-gradient-verde-soft hover:shadow-verde card-verde" : ""}
          ${bloqueada ? "opacity-60 cursor-not-allowed border-gray-200 bg-gradient-gray-lock" : ""}
          ${!completada && !bloqueada ? "cursor-pointer card-brown border-[#d4a574]/30" : ""}
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base flex items-center gap-2 dark:text-white">
                <span>Lección {numero}</span>
                {completada && <CheckCircledIcon className="h-4 w-4 text-[#76b57b] shrink-0" />}
                {bloqueada && <LockClosedIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-1 dark:text-gray-300">
                {titulo}
              </CardDescription>
            </div>
            <NivelDificultadBadge dificultad={dificultad} size="sm" />
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground dark:text-gray-300 mb-3 line-clamp-2">
            {descripcion}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span>{palabras.length} palabras</span>
              <Badge
                variant="outline"
                className="bg-gradient-sun-soft text-[#f3b62a] border-[#f3b62a]/30"
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
