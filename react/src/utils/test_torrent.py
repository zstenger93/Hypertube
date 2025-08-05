import libtorrent as lt
import time
import os

# Path to the .torrent file
torrent_path = './CC_1916_09_04_TheCount_archive.torrent'

# Directory to save the downloaded files
download_dir = './downloads'
os.makedirs(download_dir, exist_ok=True)

# Create a session
session = lt.session()
session.listen_on(6881, 6891)

# Add the torrent
info = lt.torrent_info(torrent_path)
handle = session.add_torrent({'ti': info, 'save_path': download_dir})
print(f"Downloading: {info.name()}")

# Monitor the download progress
while not handle.is_seed():
    status = handle.status()
    print(f"Progress: {status.progress * 100:.2f}% | Download Rate: {status.download_rate / 1000:.2f} kB/s | Upload Rate: {status.upload_rate / 1000:.2f} kB/s | Peers: {status.num_peers}")
    time.sleep(1)

print("Download complete!")