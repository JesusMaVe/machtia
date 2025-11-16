"""
Utilidades de seguridad para prevenir inyección NoSQL y validar inputs.

SEGURIDAD CRÍTICA: Estas funciones previenen ataques de inyección NoSQL
que podrían permitir bypass de autenticación y acceso no autorizado.
"""
import re
from typing import Any, Union


def sanitizar_email(email: Any) -> str:
    """
    Valida y sanitiza un email para prevenir inyección NoSQL.

    VULNERABILIDAD MITIGADA: Sin esta validación, un atacante podría enviar
    {"$ne": null} como email para bypassear la autenticación.

    Args:
        email: Input del usuario (puede ser cualquier tipo)

    Returns:
        str: Email validado y normalizado (lowercase)

    Raises:
        ValueError: Si el email no es un string válido

    Ejemplo de ataque bloqueado:
        POST /api/auth/login
        {"email": {"$ne": null}, "password": "cualquiera"}
        # Sin sanitización: buscaría ANY usuario donde email != null
        # Con sanitización: Raise ValueError
    """
    # CRÍTICO: Validar que sea string, no objeto JSON
    if not isinstance(email, str):
        raise ValueError("Email debe ser un string, no un objeto o array")

    # Validar longitud máxima (previene ataques de DoS)
    if len(email) > 255:
        raise ValueError("Email excede longitud máxima permitida")

    # Validar formato de email (regex básico pero efectivo)
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        raise ValueError("Formato de email inválido")

    # Bloquear caracteres de operadores MongoDB
    operadores_mongodb = ['$', '{', '}', '[', ']']
    for operador in operadores_mongodb:
        if operador in email:
            raise ValueError(f"Email contiene caracteres no permitidos: {operador}")

    # Normalizar a lowercase
    return email.lower().strip()


def sanitizar_input_mongo(value: Any, tipo_esperado: type = str, max_length: int = None,
                           campo_nombre: str = "campo") -> Any:
    """
    Sanitiza inputs genéricos para queries de MongoDB.

    VULNERABILIDAD MITIGADA: Previene inyección de operadores MongoDB
    como $ne, $gt, $where, etc. que permiten queries maliciosas.

    Args:
        value: Valor a sanitizar
        tipo_esperado: Tipo de dato esperado (str, int, bool)
        max_length: Longitud máxima para strings (opcional)
        campo_nombre: Nombre del campo (para mensajes de error)

    Returns:
        Any: Valor sanitizado del tipo correcto

    Raises:
        ValueError: Si el valor no cumple validaciones

    Ejemplos de ataques bloqueados:
        1. {"leccion_id": {"$gt": 0}} -> Accedería a TODAS las lecciones
        2. {"nivel_id": {"$ne": 999}} -> Accedería a todos los niveles excepto uno
        3. {"tema": {"$where": "malicious_code"}} -> Ejecución de código
    """
    # CRÍTICO: Validar tipo de dato
    if not isinstance(value, tipo_esperado):
        raise ValueError(
            f"{campo_nombre} debe ser de tipo {tipo_esperado.__name__}, "
            f"recibido: {type(value).__name__}"
        )

    # Validaciones específicas por tipo
    if tipo_esperado == str:
        # Validar longitud máxima
        if max_length and len(value) > max_length:
            raise ValueError(
                f"{campo_nombre} excede longitud máxima de {max_length} caracteres"
            )

        # Bloquear operadores MongoDB en strings
        operadores_mongodb = ['$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin',
                              '$where', '$regex', '$exists', '$type', '$expr']
        for operador in operadores_mongodb:
            if operador in value:
                raise ValueError(
                    f"{campo_nombre} contiene operador MongoDB no permitido: {operador}"
                )

        # Bloquear caracteres peligrosos
        caracteres_peligrosos = ['{', '}', '[', ']', '$']
        for caracter in caracteres_peligrosos:
            if caracter in value:
                raise ValueError(
                    f"{campo_nombre} contiene caracteres no permitidos: {caracter}"
                )

        return value.strip()

    elif tipo_esperado == int:
        # Validar rango razonable para IDs
        if value < 0:
            raise ValueError(f"{campo_nombre} no puede ser negativo")

        if value > 1000000:  # Límite arbitrario pero razonable
            raise ValueError(f"{campo_nombre} excede valor máximo permitido")

        return value

    elif tipo_esperado == bool:
        return value

    else:
        # Para otros tipos, retornar sin modificar
        return value


def sanitizar_query_params(params: dict, whitelist: dict) -> dict:
    """
    Sanitiza parámetros de query usando una whitelist de valores permitidos.

    VULNERABILIDAD MITIGADA: Previene injection mediante query params
    y asegura que solo valores predefinidos sean aceptados.

    Args:
        params: Diccionario de parámetros del request.GET
        whitelist: Diccionario de {param_name: [valores_permitidos]}

    Returns:
        dict: Parámetros sanitizados

    Raises:
        ValueError: Si algún parámetro no está en la whitelist

    Ejemplo de uso:
        whitelist = {
            'dificultad': ['principiante', 'intermedio', 'avanzado'],
            'tema': ['saludos', 'numeros', 'familia', 'animales']
        }
        params_sanitizados = sanitizar_query_params(request.GET, whitelist)
    """
    resultado = {}

    for param_name, valor in params.items():
        # Ignorar parámetros no esperados
        if param_name not in whitelist:
            continue

        # Validar que el valor esté en la whitelist
        valores_permitidos = whitelist[param_name]

        if valor not in valores_permitidos:
            raise ValueError(
                f"Valor no permitido para {param_name}: {valor}. "
                f"Valores permitidos: {', '.join(valores_permitidos)}"
            )

        resultado[param_name] = valor

    return resultado


def sanitizar_user_id(user_id: Any) -> str:
    """
    Sanitiza y valida un user_id (ObjectId de MongoDB).

    Args:
        user_id: ID del usuario a validar

    Returns:
        str: User ID validado como string

    Raises:
        ValueError: Si el user_id no es válido
    """
    if not isinstance(user_id, str):
        raise ValueError("User ID debe ser un string")

    # Validar longitud de ObjectId (24 caracteres hexadecimales)
    if len(user_id) != 24:
        raise ValueError("User ID debe tener 24 caracteres")

    # Validar que solo contenga caracteres hexadecimales
    if not re.match(r'^[0-9a-fA-F]{24}$', user_id):
        raise ValueError("User ID contiene caracteres inválidos")

    return user_id


def validar_password_input(password: Any) -> str:
    """
    Valida que el password sea un string (no un objeto para injection).

    VULNERABILIDAD MITIGADA: Previene envío de objetos como password
    para bypassear la verificación de contraseña.

    Args:
        password: Input de password del usuario

    Returns:
        str: Password validado

    Raises:
        ValueError: Si el password no es un string válido
    """
    if not isinstance(password, str):
        raise ValueError("Password debe ser un string, no un objeto o array")

    # Validar longitud mínima y máxima
    if len(password) < 1:
        raise ValueError("Password no puede estar vacío")

    if len(password) > 128:
        raise ValueError("Password excede longitud máxima de 128 caracteres")

    return password
