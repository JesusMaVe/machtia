"""
Middleware de protección CSRF para APIs REST con JWT.

SEGURIDAD MEDIA CORREGIDA: Protege contra ataques CSRF validando el origen
de las peticiones y utilizando SameSite cookies cuando corresponda.

Este middleware NO usa el token CSRF tradicional de Django (que es para cookies de sesión),
sino que valida:
1. Origin/Referer headers en peticiones no-GET
2. Permite solo orígenes configurados en CORS_ALLOWED_ORIGINS
3. Bloquea peticiones cross-origin no autorizadas
"""
from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from urllib.parse import urlparse
import logging

logger = logging.getLogger('security')


class CSRFProtectionMiddleware(MiddlewareMixin):
    """
    Middleware de protección CSRF para APIs REST.

    Valida que las peticiones de modificación (POST, PUT, PATCH, DELETE)
    provengan de orígenes permitidos.

    IMPORTANTE: Este middleware se aplica SOLO a endpoints de API REST.
    No interfiere con la autenticación JWT normal.
    """

    # Métodos que requieren validación CSRF
    METODOS_PROTEGIDOS = ['POST', 'PUT', 'PATCH', 'DELETE']

    # Rutas excluidas de protección CSRF (útil para webhooks externos)
    RUTAS_EXCLUIDAS = [
        '/api/auth/test-connection/',  # Endpoint de prueba público
    ]

    def process_request(self, request):
        """
        Procesa la petición y valida CSRF si es necesario.

        Args:
            request: HttpRequest de Django

        Returns:
            None si la petición es válida
            JsonResponse con error 403 si falla validación CSRF
        """
        # Solo validar métodos de modificación
        if request.method not in self.METODOS_PROTEGIDOS:
            return None

        # Verificar si la ruta está excluida
        if self._is_ruta_excluida(request.path):
            return None

        # Validar origen de la petición
        if not self._validar_origen(request):
            # Log de evento de seguridad
            logger.warning(
                f"CSRF_ATTACK_BLOCKED | Petición bloqueada por CSRF | "
                f"Method: {request.method} | Path: {request.path} | "
                f"Origin: {self._get_origen(request)} | "
                f"IP: {self._get_ip_cliente(request)}"
            )

            return JsonResponse({
                'status': 'error',
                'message': 'Origen de petición no autorizado',
                'tipo_error': 'csrf_validation_failed',
                'ayuda': 'Esta petición fue bloqueada por protección CSRF. Verifica que estés enviando peticiones desde un origen permitido.'
            }, status=403)

        return None

    def _is_ruta_excluida(self, path: str) -> bool:
        """
        Verifica si la ruta está excluida de protección CSRF.

        Args:
            path: Ruta de la petición

        Returns:
            bool: True si está excluida, False en caso contrario
        """
        for ruta_excluida in self.RUTAS_EXCLUIDAS:
            if path.startswith(ruta_excluida):
                return True
        return False

    def _validar_origen(self, request) -> bool:
        """
        Valida que el origen de la petición esté en la lista de permitidos.

        Args:
            request: HttpRequest de Django

        Returns:
            bool: True si el origen es válido, False en caso contrario
        """
        origen = self._get_origen(request)

        # Si no hay origen, rechazar (excepto para peticiones locales en desarrollo)
        if not origen:
            # En desarrollo, permitir peticiones sin Origin (ej: Postman, cURL)
            if settings.DEBUG:
                return True
            return False

        # Parsear origen
        try:
            origen_parsed = urlparse(origen)
            origen_normalizado = f"{origen_parsed.scheme}://{origen_parsed.netloc}"
        except Exception:
            return False

        # Verificar contra CORS_ALLOWED_ORIGINS
        origenes_permitidos = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])

        # En desarrollo, también permitir localhost con cualquier puerto
        if settings.DEBUG:
            if origen_parsed.hostname in ['localhost', '127.0.0.1']:
                return True

        return origen_normalizado in origenes_permitidos

    def _get_origen(self, request) -> str:
        """
        Obtiene el origen de la petición desde los headers Origin o Referer.

        Args:
            request: HttpRequest de Django

        Returns:
            str: Origen de la petición o None si no está presente
        """
        # Primero intentar con Origin header (más confiable)
        origen = request.META.get('HTTP_ORIGIN')
        if origen:
            return origen

        # Fallback a Referer header
        referer = request.META.get('HTTP_REFERER')
        if referer:
            # Extraer solo scheme://host:port del referer
            try:
                parsed = urlparse(referer)
                return f"{parsed.scheme}://{parsed.netloc}"
            except Exception:
                return None

        return None

    def _get_ip_cliente(self, request) -> str:
        """
        Obtiene la IP del cliente de la petición.

        Args:
            request: HttpRequest de Django

        Returns:
            str: IP del cliente
        """
        # Intentar obtener IP real si está detrás de proxy
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        return ip
