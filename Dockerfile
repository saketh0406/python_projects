# Use official Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for building packages like bcrypt, psycopg2, etc.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libffi-dev \
        python3-dev \
        libssl-dev \
        git \
        curl && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt cryptography

# Copy the rest of the project
COPY . .

# Expose port 8000
EXPOSE 8000

# Optional: add an entrypoint to run migrations if needed
# You can run migrations like this:
# docker run --rm -v ${PWD}:/app -w /app <image> alembic upgrade head

# Default command: run FastAPI
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

