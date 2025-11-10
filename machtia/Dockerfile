FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la app
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando para correr Django
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
