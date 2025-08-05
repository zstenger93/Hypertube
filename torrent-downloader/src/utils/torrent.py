import bencodepy
import hashlib
import requests
import os

def parse_torrent_file(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f'Torrent file not found: {file_path}')

    with open(file_path, 'rb') as f:
        torrent_data = bencodepy.decode(f.read())

    info = torrent_data[b'info']
    info_hash = hashlib.sha1(bencodepy.encode(info)).hexdigest()
    announce = torrent_data[b'announce'].decode('utf-8')
    name = info[b'name'].decode('utf-8')
    total_size = sum(file[b'length'] for file in info[b'files']) if b'files' in info else info[b'length']

    return {
        'announce': announce,
        'info_hash': info_hash,
        'name': name,
        'total_size': total_size,
        'files': info[b'files'] if b'files' in info else [{b'path': [name.encode('utf-8')], b'length': total_size}]
    }


def get_peers_from_tracker(tracker_url, info_hash, total_size):
    peer_id = '-PY0001-' + os.urandom(12).hex()
    params = {
        'info_hash': info_hash,
        'peer_id': peer_id,
        'port': 6881,
        'uploaded': 0,
        'downloaded': 0,
        'left': total_size,
        'compact': 1
    }
    print(f"Requesting tracker: {tracker_url}")
    print(f"Parameters: {params}")

    response = requests.get(tracker_url, params=params)
    print(f"Status Code: {response.status_code}")

    if response.status_code != 200:
        print(f"Tracker response: {response.content}")
        raise Exception(f"Failed to connect to tracker: {response.content}")

    return response.content  # This should be processed to extract peers from the response.