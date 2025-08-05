import asyncio
from torrentp import TorrentDownloader

file_path = './src/temp_torrent/ubuntu-22.04.3-desktop-amd64.iso.torrent'

print(lt.version)

try:
    # Start the download process
    try:
        torrent_file = TorrentDownloader(file_path, './download')
        asyncio.run(torrent_file.start_download())  # start_download() is an asynchronous method
    except Exception as e:
        print(f"Error during download: {e}")
except FileNotFoundError as fnf_error:
    print(f"File not found: {fnf_error}")
except ImportError as imp_error:
    print(f"Import error: {imp_error}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

# Pausing the download
# torrent_file.pause_download()

# # Resuming the download
# torrent_file.resume_download()

# # Stopping the download
# torrent_file.stop_download()