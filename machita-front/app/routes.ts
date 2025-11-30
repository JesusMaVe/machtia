import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Rutas públicas
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("auth/login", "routes/auth.login.tsx"),

  // Layout para usuarios autenticados (con navegación persistente)
  layout("routes/app-layout.tsx", [
    route("aprende", "routes/aprende.tsx"),
    route("lecciones", "routes/lecciones.tsx"),
    route("leccion/:leccionId", "routes/leccion.$leccionId.tsx"),
    route("progreso", "routes/progreso.tsx"),
  ]),
] satisfies RouteConfig;
