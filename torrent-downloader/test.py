


import asyncio
from torrentp import TorrentDownloader

file_path = './src/temp_torrent/ubuntu-22.04.3-desktop-amd64.iso.torrent'

torrent_file = TorrentDownloader(file_path, './download')
# Start the download process
asyncio.run(torrent_file.start_download()) # start_download() is a asynchronous method 

# Pausing the download
# torrent_file.pause_download()

# # Resuming the download
# torrent_file.resume_download()

# # Stopping the download
# torrent_file.stop_download()