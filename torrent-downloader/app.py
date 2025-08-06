from flask import Flask, request, jsonify
import libtorrent as lt
import time
import os

app = Flask(__name__)

@app.route('/upload-torrent', methods=['POST'])
def upload_torrent():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    torrent_file = request.files['file']
    save_path = './src/temp_torrent'
    os.makedirs(save_path, exist_ok=True)
    file_path = os.path.join(save_path, torrent_file.filename)
    torrent_file.save(file_path)

    # Create a session with modern API
    session = lt.session({
        'listen_interfaces': '0.0.0.0:6881',  # Listen on all interfaces on port 6881
        'enable_dht': True,
        'enable_lsd': True,
        'enable_upnp': True,
        'enable_natpmp': True
    })

    upload_rate_limit = 5 * 1024  # 5 KB/s
    download_rate_limit = 5 * 1024  # 5 KB/s
    session.set_upload_rate_limit(upload_rate_limit)
    session.set_download_rate_limit(download_rate_limit)

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

    return jsonify({
        'tracker_status': [{'url': tracker['url'], 'status': tracker['message']} for tracker in handle.trackers()],
        'download_status': "status_list",
        'peer_info': "peer_info"
    })

if __name__ == '__main__':
    app.run(debug=True)