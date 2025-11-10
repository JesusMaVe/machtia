import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { Dificultad } from "@/shared/constants";
import type { Tema } from "../../types";

interface LeccionesFilterProps {
  dificultad: Dificultad | "todas";
  tema: Tema | "todos";
  temasDisponibles: Tema[];
  onDificultadChange: (value: Dificultad | "todas") => void;
  onTemaChange: (value: Tema | "todos") => void;
  onLimpiar: () => void;
}

export function LeccionesFilter({
  dificultad,
  tema,
  temasDisponibles,
  onDificultadChange,
  onTemaChange,
  onLimpiar,
}: LeccionesFilterProps) {
  const hayFiltrosActivos = dificultad !== "todas" || tema !== "todos";

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Dificultad</label>
        <Select
          value={dificultad}
          onValueChange={(value: string) => onDificultadChange(value as Dificultad | "todas")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las dificultades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="principiante">Principiante</SelectItem>
            <SelectItem value="intermedio">Intermedio</SelectItem>
            <SelectItem value="avanzado">Avanzado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Tema</label>
        <Select
          value={tema}
          onValueChange={(value: string) => onTemaChange(value as Tema | "todos")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos los temas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {temasDisponibles.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hayFiltrosActivos && (
        <div className="flex items-end">
          <Button variant="outline" size="sm" onClick={onLimpiar} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
