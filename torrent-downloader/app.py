from flask import Flask, request, jsonify
import libtorrent as lt
from flask_cors import CORS
import time
import os
import threading

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

        # Start the download in a separate thread
        def download_torrent():
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

                upload_rate_limit = 80 * 1024  # 80 KB/s
                download_rate_limit = 80 * 1024  # 80 KB/s
                session.set_upload_rate_limit(upload_rate_limit)
                session.set_download_rate_limit(download_rate_limit)
                handle = session.add_torrent(params)

                print("\nTracker Status:")
                for tracker in handle.trackers():
                    print(f" - URL: {tracker['url']}, Status: {tracker['message']}")
                    
                print("Setting file priorities...")
                file_priorities = [0] * torrent_info.num_files()  # Default: Do not download any files
                mp4_file_index = None

                for index in range(torrent_info.num_files()):
                    file_entry = torrent_info.file_at(index)
                    if file_entry.path.endswith('.mp4'):
                        file_priorities[index] = 1  # Enable download for .mp4 files
                        mp4_file_index = index
                        print(f"Downloading: {file_entry.path}")
                        break
                    else:
                        print(f"Skipping: {file_entry.path}")
                handle.prioritize_files(file_priorities)

                if mp4_file_index is not None:
                    print("Prioritizing pieces dynamically for streaming...")
                    file_entry = torrent_info.file_at(mp4_file_index)
                    start_piece = file_entry.offset // torrent_info.piece_length()
                    end_piece = (file_entry.offset + file_entry.size) // torrent_info.piece_length()

                    print("Starting torrent download...")
                    time.sleep(2)  # Allow some time for the torrent to initialize
                    # Monitor and dynamically prioritize pieces
                    while True:  # Continue monitoring until the download completes
                        status = handle.status()
                        # Handle the 'checking_files' state
                        if status.state == lt.torrent_status.checking_files:
                            print("Torrent is checking files. Waiting...")
                            time.sleep(5)
                            continue

                        downloaded_pieces = status.pieces
                        print(f"State: {status.state}, Progress: {status.progress * 100:.2f}%, Peers: {status.num_peers}")

                        # Prioritize the next pieces dynamically
                        for piece in range(start_piece, end_piece):
                            if not downloaded_pieces[piece]:  # If the piece is not downloaded
                                handle.piece_priority(piece, 7)  # Set high priority for the piece
                                print(f"Prioritized piece {piece} for streaming.")
                                break  # Prioritize one piece at a time

                        if status.progress >= 1.0:  # Download complete
                            print("Download completed successfully.")
                            break

                        time.sleep(5)  # Wait before checking again

            except Exception as e:
                print(f"Error initializing libtorrent session: {str(e)}")

        # Start the download thread
        download_thread = threading.Thread(target=download_torrent)
        download_thread.start()

        # Return a response to the frontend
        return jsonify({'message': 'Download started', 'torrent_name': torrent_info.name()})

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
