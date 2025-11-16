"""
Middleware para agregar headers de seguridad HTTP adicionales.

SEGURIDAD MEDIA CORREGIDA: Implementa Content Security Policy (CSP) y
Permissions Policy para proteger contra XSS, data injection y abuso de APIs.
"""
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware que agrega headers de seguridad HTTP modernos a todas las respuestas.

    Headers implementados:
    - Content-Security-Policy (CSP): Previene XSS y data injection
    - Permissions-Policy: Controla acceso a APIs del navegador
    - X-Content-Type-Options: Previene MIME sniffing
    - X-Frame-Options: Previene clickjacking
    - Referrer-Policy: Controla información del referrer
    """

    def process_response(self, request, response):
        """
        Agrega headers de seguridad a la respuesta.

        Args:
            request: HttpRequest de Django
            response: HttpResponse de Django

        Returns:
            HttpResponse con headers de seguridad agregados
        """
        # Content-Security-Policy (CSP)
        csp_directives = []

        if hasattr(settings, 'CSP_DEFAULT_SRC'):
            csp_directives.append(f"default-src {' '.join(settings.CSP_DEFAULT_SRC)}")

        if hasattr(settings, 'CSP_SCRIPT_SRC'):
            csp_directives.append(f"script-src {' '.join(settings.CSP_SCRIPT_SRC)}")

        if hasattr(settings, 'CSP_STYLE_SRC'):
            csp_directives.append(f"style-src {' '.join(settings.CSP_STYLE_SRC)}")

        if hasattr(settings, 'CSP_IMG_SRC'):
            csp_directives.append(f"img-src {' '.join(settings.CSP_IMG_SRC)}")

        if hasattr(settings, 'CSP_FONT_SRC'):
            csp_directives.append(f"font-src {' '.join(settings.CSP_FONT_SRC)}")

        if hasattr(settings, 'CSP_CONNECT_SRC'):
            csp_directives.append(f"connect-src {' '.join(settings.CSP_CONNECT_SRC)}")

        if hasattr(settings, 'CSP_FRAME_ANCESTORS'):
            csp_directives.append(f"frame-ancestors {' '.join(settings.CSP_FRAME_ANCESTORS)}")

        if csp_directives:
            response['Content-Security-Policy'] = '; '.join(csp_directives)

        # Permissions-Policy (moderna, reemplaza Feature-Policy)
        if hasattr(settings, 'PERMISSIONS_POLICY'):
            permissions_directives = []
            for feature, allowlist in settings.PERMISSIONS_POLICY.items():
                if not allowlist:
                    # Lista vacía = deshabilitar completamente
                    permissions_directives.append(f"{feature}=()")
                else:
                    # Lista con orígenes permitidos
                    origins = ' '.join(f'"{origin}"' for origin in allowlist)
                    permissions_directives.append(f"{feature}=({origins})")

            if permissions_directives:
                response['Permissions-Policy'] = ', '.join(permissions_directives)

        # X-Content-Type-Options (siempre)
        response['X-Content-Type-Options'] = 'nosniff'

        # Referrer-Policy (si está configurado)
        if hasattr(settings, 'SECURE_REFERRER_POLICY'):
            response['Referrer-Policy'] = settings.SECURE_REFERRER_POLICY
        else:
            # Default seguro si no está configurado
            response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # X-Frame-Options (prevenir clickjacking)
        # Ya lo maneja Django, pero aseguramos que esté
        if 'X-Frame-Options' not in response:
            response['X-Frame-Options'] = 'DENY'

        return response
