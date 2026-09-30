FROM python:3.11-slim

WORKDIR /app/server
ENV PYTHONPATH=/app

# Install system dependencies (e.g. for PostgreSQL, spaCy, audio processing)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ ./
COPY ml/ /app/ml/

# Run uvicorn on port 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
