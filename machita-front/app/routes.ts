import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("lecciones", "routes/lecciones.tsx"),
  route("lecciones/:id", "routes/lecciones.$id.tsx"),
  route("progreso", "routes/progreso.tsx"),
] satisfies RouteConfig;
