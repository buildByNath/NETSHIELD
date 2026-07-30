# Use a lightweight official Python runtime
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system utilities needed for Python dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install python libraries
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code into the container
COPY backend/ ./backend

# Expose FastAPI server port
EXPOSE 8000

# Set Python path to ensure module imports resolve correctly
ENV PYTHONPATH=/app

# Command to run uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
