import libtorrent as lt
import time

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

# Set upload and download rate limits (in bytes per second)
# upload_rate_limit = 5 * 1024  # 5 KB/s
# download_rate_limit = 5 * 1024  # 5 KB/s
# session.set_upload_rate_limit(upload_rate_limit)
# session.set_download_rate_limit(download_rate_limit)

# Enable debug logging
# session.set_alert_mask(lt.alert.category_t.all_categories)

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
try:
    while True:  # Keep the session open indefinitely
        status = handle.status()
        print(f" - State: {status.state}, Progress: {status.progress * 100:.2f}%, Peers: {status.num_peers}")
        
        # Print debug alerts
        # alerts = session.pop_alerts()
        # for alert in alerts:
        #     print(alert)
        
        time.sleep(30)  # Check status every 30 seconds
except KeyboardInterrupt:
    print("\nSeeding stopped manually.")

# Stop the session
session.pause()