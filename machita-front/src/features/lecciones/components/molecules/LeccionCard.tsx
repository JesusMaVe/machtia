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
    <Link
      to={bloqueada ? "#" : `/leccion/${id}`}
      className="block h-full"
      onClick={(e) => bloqueada && e.preventDefault()}
    >
      <Card
        className={`
          h-full transition-smooth flex flex-col bg-white dark:bg-[#1a1a1a]
          ${completada ? "border-[#76b57b]/40 shadow-sm hover:shadow-verde-soft" : "border-gray-200 dark:border-gray-700"}
          ${bloqueada ? "cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:-translate-y-0.5"}
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className={`text-base flex items-center gap-2 ${bloqueada ? "text-gray-400 dark:text-gray-500" : "text-obsidiana dark:text-white"}`}>
                <span>Lección {numero}</span>
                {completada && <CheckCircledIcon className="h-4 w-4 text-[#76b57b] dark:text-purple-400 shrink-0" />}
                {bloqueada && <LockClosedIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />}
              </CardTitle>
              <CardDescription className={`mt-1 line-clamp-1 ${bloqueada ? "text-gray-400 dark:text-gray-500" : "dark:text-gray-300"}`}>
                {titulo}
              </CardDescription>
            </div>
            <NivelDificultadBadge dificultad={dificultad} size="sm" />
          </div>
        </CardHeader>

        <CardContent className="pb-4 flex-1 flex flex-col justify-between">
          <p className={`text-sm mb-3 line-clamp-2 ${bloqueada ? "text-gray-400 dark:text-gray-500" : "text-muted-foreground dark:text-gray-300"}`}>
            {descripcion}
          </p>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className={bloqueada ? "text-gray-400 dark:text-gray-500" : "text-muted-foreground dark:text-gray-400"}>
                {palabras.length} palabras
              </span>
              <Badge
                variant="outline"
                className={`${bloqueada ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600" : "bg-gradient-sun-soft text-[#f3b62a] border-[#f3b62a]/30"}`}
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
