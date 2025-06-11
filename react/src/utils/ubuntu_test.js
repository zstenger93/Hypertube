import fs from 'fs';
import bencode from 'bencode';
import https from 'https';
import path from 'path';
import dgram from 'dgram';
import { URL } from 'url';
import http from 'http';
import crypto from 'crypto';

// ======================
// 1. Parse Torrent File
// ======================
const parseTorrentFile = (filePath) => {
    const torrent = bencode.decode(fs.readFileSync(filePath));
    const asciiNumbers = torrent.announce.toString().split(',').map(Number);
    const asciiNumbersName = torrent.info.name.toString().split(',').map(Number);
    const trackerName = asciiNumbersName.map((num) => String.fromCharCode(num)).join('');
    const trackerUrl = asciiNumbers.map((num) => String.fromCharCode(num)).join('');


    
    const name = trackerName
    const announce = trackerUrl
  
    const infoHash = crypto.createHash('sha1')
      .update(bencode.encode(torrent.info))
      .digest('hex');
  
    const totalSize = torrent.info.files?.reduce((acc, file) => acc + file.length, 0) 
      || torrent.info.length;
  
    return {
      announce,
      infoHash,
      totalSize,
      name,
      files: torrent.info.files?.map(file => ({
        path: file.path.map(p => decodeBuffer(p)).join('/'),
        length: file.length,
      })) || [{ path: name, length: torrent.info.length }],
    };
  };

// ======================
// 1.1 encode shit
// ======================

const encodeBinaryInfoHash = (infoHash) => {
    const rawHash = Buffer.from(infoHash, 'hex'); // Convert hex to binary Buffer
    return rawHash.toString('binary') // Convert to binary string
      .split('') // Split into individual bytes
      .map((char) => {
        const code = char.charCodeAt(0);
        return code >= 0x20 && code <= 0x7E ? char : `%${code.toString(16).padStart(2, '0').toUpperCase()}`;
      })
      .join(''); // Rejoin into a properly escaped string
  };

// ======================
// 2. Fetch Peers from Tracker
// ======================
const getPeersFromTracker = async (trackerUrl, rawInfoHash) => {
    return new Promise((resolve, reject) => {
      const peerId = '-HY0001-' + crypto.randomBytes(12).toString('hex');
      const url = new URL(trackerUrl);
      
      // Manually construct query string with proper encoding
      const query = [
        `info_hash=${rawInfoHash.toString('binary').replace(/[^\w]/g, (c) => 
          '%' + c.charCodeAt(0).toString(16).toUpperCase()
        )}`,
        `peer_id=${peerId}`,
        'port=6881',
        'uploaded=0',
        'downloaded=0',
        'left=5037662208', // Actual Ubuntu ISO size
        'compact=1',
        'event=started'
      ].join('&');
  
      url.search = query;
  
      const options = {
        headers: {
          'User-Agent': 'qBittorrent/4.3.9',
          'Accept': '*/*',
          'Connection': 'close'
        },
        timeout: 10000
      };
  
      console.log('Requesting:', url.toString().split('?')[0] + '?info_hash=...');
  
      https.get(url.toString(), options, (res) => {
        let data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          try {
            const response = bencode.decode(Buffer.concat(data));
            if (response['failure reason']) {
              throw new Error(response['failure reason'].toString());
            }
            const peers = parsePeers(response.peers);
            resolve(peers);
          } catch (err) {
            console.error('Tracker response:', Buffer.concat(data).toString());
            reject(err);
          }
        });
      }).on('error', reject);
    });
  };

// Parse compact peer list (binary format)
const parsePeers = (peersBuffer) => {
  const peers = [];
  for (let i = 0; i < peersBuffer.length; i += 6) {
    const ip = peersBuffer.slice(i, i + 4).join('.');
    const port = peersBuffer.readUInt16BE(i + 4);
    peers.push({ ip, port });
  }
  return peers;
};

// ======================
// 3. Test with Ubuntu Torrent
// ======================
(async () => {
  try {
    // Download Ubuntu .torrent file (if not already present)
    const torrentUrl = 'https://releases.ubuntu.com/22.04.3/ubuntu-22.04.3-desktop-amd64.iso.torrent';
    const torrentFile = './ubuntu-22.04.3-desktop-amd64.iso.torrent';
    
    if (!fs.existsSync(torrentFile)) {
      console.log('Downloading torrent file...');
      const file = fs.createWriteStream(torrentFile);
      await new Promise((resolve, reject) => {
        https.get(torrentUrl, (res) => res.pipe(file).on('finish', resolve).on('error', reject));
      });
    }
    else {
      console.log('Using existing torrent file:', torrentFile);
    }

    // Parse torrent and fetch peers
    const torrent = parseTorrentFile(torrentFile);
    console.log('Torrent Metadata:', {
        name: torrent.name,
        size: (torrent.totalSize / 1e9).toFixed(2) + ' GB',
        infoHash: torrent.infoHash,
        announce: torrent.announce,
        files: torrent.files,
      });

  // Try multiple trackers
  const trackers = [
    'http://tracker.opentrackr.org:1337/announce',
    'http://tracker.openbittorrent.com:80/announce',
    'https://tracker.tamersunion.org:443/announce',
    'https://tracker.renfei.net:443/announce',
    torrent.announce
  ];

  for (const tracker of trackers) {
    try {
      console.log(`\n =========== =========== ============ =============== ================ ======\n`);  
      console.log(`\nTrying tracker: ${tracker}`);
      const peers = await getPeersFromTracker(tracker, torrent.infoHash);
      console.log(`Found ${peers.length} peers from ${tracker}`);
      console.log('First 5 peers:', peers.slice(0, 5));
      break; // Stop after first successful tracker
    } catch (err) {
      console.log(`Failed with ${tracker}: ${err.message}`);
    }
  }
} catch (err) {
  console.error('Error:', err.message);
}
})();