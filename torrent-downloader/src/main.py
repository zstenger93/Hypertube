import os
import sys
import argparse
from utils.torrent import parse_torrent_file, get_peers_from_tracker

def main():
    parser = argparse.ArgumentParser(description='Torrent Downloader')
    parser.add_argument('torrent_file', type=str, help='Path to the .torrent file')
    args = parser.parse_args()

    if not os.path.exists(args.torrent_file):
        print(f"Error: The file {args.torrent_file} does not exist.")
        sys.exit(1)

    # Parse the torrent file
    torrent = parse_torrent_file(args.torrent_file)
    print('Torrent Metadata:', {
        'name': torrent['name'],
        'size': torrent['total_size'],
        'info_hash': torrent['info_hash'],
        'announce': torrent['announce'],
        'files': torrent['files'],
    })

    # Fetch peers from the tracker
    peers = get_peers_from_tracker(torrent['announce'], torrent['info_hash'], torrent['total_size'])
    print(f'Found {len(peers)} peers:')
    print(peers)  # This will print the raw peer data; you may want to format it further.
    # for peer in peers:
    #     print(f"Peer: {peer['ip']}:{peer['port']}")

if __name__ == '__main__':
    main()