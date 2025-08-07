# Torrent Downloader

This project is a simple torrent downloader implemented in Python. It allows users to download files from torrent sources by parsing torrent files and fetching peer information from trackers.

## Project Structure

```
torrent-downloader
├── src
│   ├── main.py          # Entry point of the application
│   └── utils
│       └── torrent.py   # Utility functions for torrent handling
├── Dockerfile           # Dockerfile for building the application image
├── requirements.txt     # Python dependencies
└── README.md            # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd torrent-downloader
   ```

2. **Build the Docker image:**
   ```bash
   docker build -t torrent-downloader .
   ```

3. **Run the application:**
   ```bash
   docker run --rm torrent-downloader python src/main.py <path-to-torrent-file>
   ```

## Usage

To download a torrent file, provide the path to the `.torrent` file as a command-line argument when running the application.

Example:
```bash
docker run --rm torrent-downloader python src/main.py ./path/to/torrent-file.torrent
```

## Dependencies

The project requires the following Python libraries:

- `bencode`: For parsing torrent files.
- `requests`: For making HTTP requests to trackers.

These dependencies are listed in the `requirements.txt` file and will be installed automatically when building the Docker image.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## testing the API in dev
    # curl -X POST -F "file=@./src/temp_torrent/testmovie_short.torrent" http://localhost:5000/upload-torrent

## License

This project is licensed under the MIT License. See the LICENSE file for more details.