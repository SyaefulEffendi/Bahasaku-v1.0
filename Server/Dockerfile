FROM python:3.13-slim

WORKDIR /app

# PERBAIKAN: Mengganti 'libgl1-mesa-glx' menjadi 'libgl1'
# Ini adalah library wajib untuk OpenCV di Linux versi terbaru
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \ 
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "app.py"]