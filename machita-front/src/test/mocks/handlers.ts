import { http, HttpResponse } from "msw";
import {
  mockUser,
  mockLoginResponse,
  mockRegisterResponse,
  mockLecciones,
  mockLeccion,
  mockNiveles,
  mockNivel,
  mockRacha,
  mockEstadisticas,
  mockLogros,
  mockEstadoVidas,
} from "./data";

// Tests usan variable de entorno o fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as any;

    // Validate registration data
    if (!body.email || !body.email.includes("@")) {
      return HttpResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!body.nombre || body.nombre.trim().length === 0) {
      return HttpResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.password || body.password.length < 6) {
      return HttpResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    return HttpResponse.json(mockRegisterResponse, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json(mockLoginResponse);
    }
    // Use 400 for invalid credentials (not 401 which triggers session expired message)
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: "Logged out successfully" });
  }),

  http.get(`${API_BASE_URL}/auth/me/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate token value - "invalid-token" should fail
    const token = authHeader.replace("Bearer ", "");
    if (token === "invalid-token") {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ status: "success", user: mockUser });
  }),

  http.put(`${API_BASE_URL}/auth/me/update/`, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as any;
    return HttpResponse.json({ status: "success", user: { ...mockUser, ...body } });
  }),

  // Lecciones endpoints
  http.get(`${API_BASE_URL}/lecciones/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const dificultad = url.searchParams.get("dificultad");
    const tema = url.searchParams.get("tema");

    let filteredLecciones = mockLecciones;

    if (dificultad) {
      filteredLecciones = filteredLecciones.filter((l) => l.dificultad === dificultad);
    }

    if (tema) {
      filteredLecciones = filteredLecciones.filter((l) => l.tema === tema);
    }

    return HttpResponse.json(filteredLecciones);
  }),

  // IMPORTANT: /siguiente/ must come BEFORE /:id/ to prevent route matching issues
  http.get(`${API_BASE_URL}/lecciones/siguiente/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockLeccion);
  }),

  http.get(`${API_BASE_URL}/lecciones/:id/`, ({ request, params }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const leccion = mockLecciones.find((l) => l.id === id);
    if (!leccion) {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(leccion);
  }),

  http.post(`${API_BASE_URL}/lecciones/:id/completar/`, ({ request, params }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    // Validate id is a valid string
    if (!id || id === "invalid") {
      return HttpResponse.json({ error: "Invalid lesson id" }, { status: 400 });
    }

    return HttpResponse.json({
      exito: true,
      tomins: 10,
      mensaje: "Lección completada",
      vidasRestantes: 3,
    });
  }),

  http.post(`${API_BASE_URL}/lecciones/:id/fallar/`, ({ request, params }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    // Validate id is a valid string
    if (!id || id === "invalid") {
      return HttpResponse.json({ error: "Invalid lesson id" }, { status: 400 });
    }

    return HttpResponse.json({
      exito: false,
      tomins: 0,
      mensaje: "Lección fallada",
      vidasRestantes: 2,
    });
  }),

  // Niveles endpoints
  http.get(`${API_BASE_URL}/niveles/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockNiveles);
  }),

  // IMPORTANT: /siguiente/ must come BEFORE /:id/ to prevent route matching issues
  http.get(`${API_BASE_URL}/niveles/siguiente/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockNivel);
  }),

  http.get(`${API_BASE_URL}/niveles/:id/lecciones/`, ({ request, params }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lecciones = mockLecciones.slice(0, 2);

    // Return correct structure: { nivel, lecciones, total_lecciones }
    return HttpResponse.json({
      nivel: mockNivel,
      lecciones: lecciones,
      total_lecciones: lecciones.length,
    });
  }),

  http.get(`${API_BASE_URL}/niveles/:id/`, ({ request, params }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const nivel = mockNiveles.find((n) => n.id === id);
    if (!nivel) {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(nivel);
  }),

  http.post(`${API_BASE_URL}/niveles/:id/completar/`, ({ request, params }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    // Validate id is valid (not "invalid" string)
    if (!id || id === "invalid") {
      return HttpResponse.json({ error: "Invalid nivel id" }, { status: 400 });
    }

    return HttpResponse.json({
      mensaje: "Nivel completado",
      nivelSiguiente: 2,
    });
  }),

  // Progreso endpoints
  http.get(`${API_BASE_URL}/progreso/racha/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockRacha);
  }),

  http.get(`${API_BASE_URL}/progreso/estadisticas/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockEstadisticas);
  }),

  http.get(`${API_BASE_URL}/progreso/logros/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockLogros);
  }),

  http.get(`${API_BASE_URL}/progreso/actividad/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const dias = url.searchParams.get("dias");
    const numDias = dias ? Number(dias) : 30;

    return HttpResponse.json({
      periodo: {
        dias: numDias,
        fechaInicio: new Date(Date.now() - numDias * 86400000).toISOString(),
        fechaFin: new Date().toISOString(),
      },
      actividad: {
        totalLecciones: 10,
        totalTomins: 100,
        totalTiempo: 120,
        diasConActividad: 5,
        historial: [],
      },
      promedio: {
        lecciones: 2,
        tomins: 20,
        tiempo: 24,
      },
    });
  }),

  // Vidas endpoints
  http.get(`${API_BASE_URL}/vidas/estado/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(mockEstadoVidas);
  }),

  http.post(`${API_BASE_URL}/vidas/comprar/una/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json({
      exito: true,
      mensaje: "Vida comprada exitosamente",
      vidasNuevas: mockEstadoVidas.vidasActuales + 1,
      tominsRestantes: 50,
    });
  }),

  http.post(`${API_BASE_URL}/vidas/comprar/restaurar/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json({
      exito: true,
      mensaje: "Vidas restauradas",
      vidasNuevas: mockEstadoVidas.vidasMaximas,
      tominsRestantes: 0,
    });
  }),
];
