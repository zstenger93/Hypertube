FROM ubuntu:20.04

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Install Python, necessary packages, and libtorrent
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-libtorrent && \
    apt-get clean

# Set the working directory
WORKDIR /app

# Install dependencies globally
COPY requirements.txt .
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port Flask will run on
EXPOSE 5001

# Start the Flask application
CMD ["python3", "app.py"]