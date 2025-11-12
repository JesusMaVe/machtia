import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";

export function Pyramid() {
  const navigate = useNavigate();
  const id = "lol";

  return (
    <div className="rounded-2xl pt-4">
      <div className="flex flex-col items-center gap-4">
        {/* Nivel 1 - Superior */}
        <div
          onClick={() => navigate(`/lecciones/${id}/${id}`)}
          className="w-48 h-32 bg-amber-700 rounded-lg flex items-center justify-center shadow-lg hover:bg-amber-600 transition-colors cursor-pointer border-4 border-amber-900"
        >
          <div className="text-center text-amber-100">
            <p className="text-3xl font-bold mb-1">花</p>
            <p className="text-sm">Xochitl</p>
            <p className="text-xs opacity-75">Flor</p>
          </div>
        </div>

        {/* Nivel 2 - Medio */}
        <div className="flex gap-4">
          <div className="w-96 h-32 bg-amber-700 animate-pulse rounded-lg flex items-center justify-center shadow-lg transition-colors cursor-pointer border-4 border-amber-900">
            <div className="text-center text-amber-100">
              <p className="text-3xl font-bold mb-1">☀️</p>
              <p className="text-sm">Tonatiuh</p>
              <p className="text-xs opacity-75">Sol</p>
              <Button
                type="button"
                className="bg-amber-600 border-amber-900 hover:bg-amber-600 cursor-pointer"
              >
                <Link to={`/lecciones/${id}/${id}`} className="text-amber-900 font-medium">
                  Continuar aprendizaje
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Nivel 3 - Base */}
        <div className="flex gap-4">
          <div className="w-144 h-32 bg-amber-700 rounded-lg flex items-center justify-center shadow-lg hover:bg-amber-600 transition-colors cursor-pointer border-4 border-amber-900">
            <div className="text-center text-amber-100">
              <p className="text-3xl font-bold mb-1">🌍</p>
              <p className="text-sm">Tlalli</p>
              <p className="text-xs opacity-75">Tierra</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
