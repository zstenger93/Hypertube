FROM python:3.10-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    libtorrent-rasterbar-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the project files
COPY . .

# Install Python dependencies
RUN pip install python-libtorrent

# Expose the torrent port
EXPOSE 6881

# Run the torrent server
CMD ["python", "torrent-server.py"]tou