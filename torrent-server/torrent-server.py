import libtorrent as lt
import time

# Path to the test video torrent file
test_torrent_file = './src/temp_torrent/test_video.torrent'

# Create a session with modern API
session = lt.session({
    'listen_interfaces': '0.0.0.0:6881',  # Listen on all interfaces on port 6881
    'enable_dht': True,
    'enable_lsd': True,
    'enable_upnp': True,
    'enable_natpmp': True
})

# Load the test video torrent
torrent_info = lt.torrent_info(test_torrent_file)
params = {
    'save_path': './download',  # Directory where the test video will be saved
    'storage_mode': lt.storage_mode_t.storage_mode_sparse,
    'ti': torrent_info
}
handle = session.add_torrent(params)

print("\nTracker Status:")
for tracker in handle.trackers():
    print(f" - URL: {tracker['url']}, Status: {tracker['message']}")

# Start seeding the test video
print("Seeding the test video...")
for i in range(10):  # Check status every 5 seconds
    status = handle.status()
    print(f" - State: {status.state}, Progress: {status.progress * 100:.2f}%, Peers: {status.num_peers}")
    time.sleep(5)

# Get peer information
print("\nPeer Information:")
peers = handle.get_peer_info()
if peers:
    for peer in peers:
        print(f" - IP: {peer.ip}, Client: {peer.client}, Flags: {peer.flags}")
else:
    print("No peers connected.")

# Stop the session
session.pause()