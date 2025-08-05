FROM ubuntu:20.04

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Install Python, necessary packages, and libtorrent
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv python3-libtorrent && \
    apt-get clean

# Set the working directory
WORKDIR /app
# Set the working directory
WORKDIR /app

# Copy the project files
COPY . .

# Expose the torrent port
EXPOSE 6881

# Run the torrent server
CMD ["python3", "torrent-server.py"]