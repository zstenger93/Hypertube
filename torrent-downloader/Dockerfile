FROM ubuntu:20.04

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Install Python and necessary packages
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean

# Set the working directory
WORKDIR /app

# Create a virtual environment and install dependencies
COPY requirements.txt .
RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

CMD ["/bin/bash"]
