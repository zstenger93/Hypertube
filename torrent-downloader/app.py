from flask import Flask, request, jsonify
import libtorrent as lt
from flask_cors import CORS
import time
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost"}})

@app.route('/upload-torrent', methods=['POST'])
def upload_torrent():
    try:
        # Parse JSON data from the request
        print("Parsing JSON data...")
        data = request.get_json()
        if not data or 'id' not in data or 'link' not in data:
            print("Invalid request. Missing id or link.")
            return jsonify({'error': 'Invalid request. Missing id or link.'}), 400

        movie_id = data['id']
        torrent_link = data['link']
        print(f"Received movie_id: {movie_id}, torrent_link: {torrent_link}")

        # Download the torrent file from the provided link
        save_path = './src/temp_torrent'
        os.makedirs(save_path, exist_ok=True)
        file_path = os.path.join(save_path, f"{movie_id}.torrent")

        try:
            import requests
            print(f"Downloading torrent from: {torrent_link}")
            response = requests.get(torrent_link)
            print(f"Response status code: {response.status_code}")
            if response.status_code != 200:
                print("Failed to download torrent file.")
                return jsonify({'error': 'Failed to download torrent file from the provided link.'}), 400

            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"Torrent file saved at: {file_path}")
        except Exception as e:
            print(f"Failed to fetch torrent file: {str(e)}")
            return jsonify({'error': f'Failed to fetch torrent file: {str(e)}'}), 500

        # Validate the torrent file
        print("Validating torrent file...")
        if not os.path.exists(file_path):
            print("Torrent file not found.")
            return jsonify({'error': 'Torrent file not found.'}), 500

        try:
            torrent_info = lt.torrent_info(file_path)
            if not torrent_info.is_valid():
                print("Invalid torrent file.")
                return jsonify({'error': 'Invalid torrent file.'}), 400
            print(f"Torrent Name: {torrent_info.name()}")
        except Exception as e:
            print(f"Error validating torrent file: {str(e)}")
            return jsonify({'error': f'Error validating torrent file: {str(e)}'}), 500

        # Proceed with libtorrent logic
        print("Initializing libtorrent session...")
        try:
            session = lt.session({
                'listen_interfaces': '0.0.0.0:6881',
                'enable_dht': True,
                'enable_lsd': True,
                'enable_upnp': True,
                'enable_natpmp': True
            })

            movie_save_path = os.path.join('./downloads', movie_id)
            os.makedirs(movie_save_path, exist_ok=True)

            params = {
                'save_path': movie_save_path,
                'storage_mode': lt.storage_mode_t.storage_mode_sparse,
                'ti': torrent_info
            }
            handle = session.add_torrent(params)

            print("\nTracker Status:")
            for tracker in handle.trackers():
                print(f" - URL: {tracker['url']}, Status: {tracker['message']}")
                
            print("Starting torrent download...")
            time.sleep(2)  # Allow some time for the torrent to initialize

            for i in range(10):  # Monitor for 10 iterations
                status = handle.status()
                print(f"State: {status.state}, Progress: {status.progress * 100:.2f}%, Peers: {status.num_peers}")

                # Handle the 'checking_files' state
                if status.state == lt.torrent_status.checking_files:
                    print("Torrent is checking files. Waiting...")
                    time.sleep(5)
                    continue

                # Proceed if the torrent is downloading or seeding
                if status.state == lt.torrent_status.downloading or status.state == lt.torrent_status.seeding:
                    print("Download started successfully.")
                    for _ in range(10):  # Monitor for 10 iterations
                        status = handle.status()
                        print(f"State: {status.state}, Progress: {status.progress * 100:.2f}%, Peers: {status.num_peers}")
                        time.sleep(5)
                    return jsonify({'message': 'Download started', 'torrent_name': torrent_info.name()})

                time.sleep(5)

            print(f"Failed to start download. Final State: {status.state}")
            return jsonify({'error': 'Failed to start download. Final State: {}'.format(status.state)}), 500
        except Exception as e:
            print(f"Error initializing libtorrent session: {str(e)}")
            return jsonify({'error': f'Error initializing libtorrent session: {str(e)}'}), 500

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)