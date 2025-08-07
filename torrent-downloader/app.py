from flask import Flask, request, jsonify
import libtorrent as lt
import time
import os

app = Flask(__name__)

@app.route('/upload-torrent', methods=['POST'])
def upload_torrent():

    # Check if 42_NETWORK environment variable is set to true
    network_42_workaround = os.getenv('42_NETWORK', 'false').lower() == 'true'

    if network_42_workaround:
        predefined_torrent_path = './src/temp_torrent/testmovie_short.torrent'
        if not os.path.exists(predefined_torrent_path):
            return jsonify({'error': 'Predefined torrent file not found'}), 400
        file_path = predefined_torrent_path
    else:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        torrent_file = request.files['file']
        save_path = './src/temp_torrent'
        os.makedirs(save_path, exist_ok=True)
        file_path = os.path.join(save_path, torrent_file.filename)
        torrent_file.save(file_path)

    try:
        session = lt.session({
            'listen_interfaces': '0.0.0.0:6881',
            'enable_dht': True,
            'enable_lsd': True,
            'enable_upnp': True,
            'enable_natpmp': True
        })

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

        print("Starting torrent download...")
        time.sleep(2)  # Allow some time for the torrent to initialize

        status = handle.status()
        if status.state == lt.torrent_status.downloading or status.state == lt.torrent_status.seeding:
            return jsonify({'message': 'Download started'})
        else:
            return jsonify({'error': 'Failed to start download. State: {}'.format(status.state)}), 500

    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)