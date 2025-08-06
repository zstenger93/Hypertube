import libtorrent as lt
import time
# file_path = './src/temp_torrent/ubuntu-22.04.3-desktop-amd64.iso.torrent'
file_path = './src/temp_torrent/testmovie_short.torrent'

# Create a session with modern API
session = lt.session({
    'listen_interfaces': '0.0.0.0:6881',  # Listen on all interfaces on port 6881
    'enable_dht': True,
    'enable_lsd': True,
    'enable_upnp': True,
    'enable_natpmp': True
})

# upload_rate_limit = 5 * 1024  # 5 KB/s
# download_rate_limit = 5 * 1024  # 5 KB/s
# session.set_upload_rate_limit(upload_rate_limit)
# session.set_download_rate_limit(download_rate_limit)

# Load the torrent
torrent_info = lt.torrent_info(file_path)
params = {
    'save_path': './download',
    'storage_mode': lt.storage_mode_t.storage_mode_sparse,
    'ti': torrent_info
}
handle = session.add_torrent(params)

print("\nTracker Status:")
for tracker in handle.trackers():
    print(f" - URL: {tracker['url']}, Status: {tracker['message']}")
# Start downloading and monitor status
print("Starting torrent download...")
for i in range(10):  # Check status every 5 seconds
    status = handle.status()
    print(f" - State: {status.state}, Progress: {status.progress * 100:.2f}%, Peers: {status.num_peers}")
    time.sleep(5)

# Get peer information0
print("\nPeer Information:")
peers = handle.get_peer_info()
if peers:
    for peer in peers:
        print(f" - IP: {peer.ip}, Client: {peer.client}, Flags: {peer.flags}")
else:
    print("No peers connected.")


# Stop the session
session.pause()