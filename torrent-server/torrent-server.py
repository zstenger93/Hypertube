import libtorrent as lt
import time
import signal
import sys

# Path to the test video torrent file
test_torrent_file = './video_test/testmovie_short.torrent'

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
    'save_path': './video_test',   # Directory where the test video is located
    'storage_mode': lt.storage_mode_t.storage_mode_sparse,
    'ti': torrent_info
}
handle = session.add_torrent(params)

# Force recheck to verify the file
print("Forcing recheck of the torrent...")
handle.force_recheck()

print("\nTracker Status:")
for tracker in handle.trackers():
    print(f" - URL: {tracker['url']}, Status: {tracker['message']}")

# Start seeding the test video
print("Seeding the test video...")

# Graceful shutdown flag
shutdown_flag = False

def signal_handler(sig, frame):
    global shutdown_flag
    print("\nReceived termination signal. Shutting down...")
    shutdown_flag = True

# Register signal handler for SIGTERM
signal.signal(signal.SIGTERM, signal_handler)

try:
    while not shutdown_flag:  # Keep the session open until shutdown_flag is set
        status = handle.status()
        print(f" - State: {status.state}, Progress: {status.progress * 100:.2f}%, Peers: {status.num_peers}")
        time.sleep(30)  # Check status every 30 seconds
except KeyboardInterrupt:
    print("\nSeeding stopped manually.")

# Stop the session
session.pause()
print("Torrent session paused. Exiting...")
sys.exit(0)