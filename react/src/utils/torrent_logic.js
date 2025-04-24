// npm install bencode
import fs from 'fs';
import bencode from 'bencode';
import https from 'https';
import path from 'path';
import dgram from 'dgram';
import { URL } from 'url';
import http from 'http';
import crypto from 'crypto';



const parseTorrentFile = (filePath) => {
  const torrent = bencode.decode(fs.readFileSync(filePath));
  const asciiNumbers = torrent.announce.toString().split(',').map(Number);
  const trackerUrl = asciiNumbers.map((num) => String.fromCharCode(num)).join('');

  // Calculate info_hash
  const infoHash = crypto.createHash('sha1').update(bencode.encode(torrent.info)).digest('hex');

  // Calculate total size
  const totalSize = torrent.info.files
    ? torrent.info.files.reduce((acc, file) => acc + file.length, 0)
    : torrent.info.length;

  return {
    announce: trackerUrl,
    infoHash,
    totalSize,
    info: torrent.info,
    pieceLength: torrent.info['piece length'],
    pieces: torrent.info.pieces,
    files: torrent.info.files.map((file) => ({
      length: file.length,
      path: file.path.map((p) => p.toString()).join('/'),
    })),
  };
};

const downloadTorrent = (url, callback) => {
  const fileName = path.basename(url); // Extract the file name from the URL
  const dest = `./${fileName}`; // Save the file in the current directory with the original name

  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download file. Status code: ${response.statusCode}`);
      response.resume();
      return;
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => callback(dest)); // Pass the file path to the callback
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {}); // Delete the file if an error occurs
    console.error('Error downloading file:', err.message);
  });
};

const torrentUrl = "https://archive.org/download/CC_1916_09_04_TheCount/CC_1916_09_04_TheCount_archive.torrent";
const filePath = "./CC_1916_09_04_TheCount_archive.torrent";



// downloadTorrent(torrentUrl, (filePath) => {
//   try {
//     const result = parseTorrentFile(filePath);
//     console.log(result);
//   } catch (error) {
//     console.error('Error parsing torrent file:', error.message);
//   }
// });

// npm install simple-peer



// Getting peers from tracker async function creating request ehaders
const createConnectionRequest = () => {
  const buffer = Buffer.alloc(16);
  buffer.writeUInt32BE(0x417, 0); // Protocol ID (high)
  buffer.writeUInt32BE(0x27101980, 4); // Protocol ID (low)
  buffer.writeUInt32BE(0, 8); // Action (0 = connect)
  buffer.writeUInt32BE(Math.floor(Math.random() * 0xFFFFFFFF), 12); // Transaction ID
  return buffer;
};


const generatePeerId = () => {
  return '-HY0001-' + crypto.randomBytes(12).toString('hex'); // Example peer ID
};

const getPeersFromTracker = (trackerUrl, infoHash, totalSize) => {
  return new Promise((resolve, reject) => {
    const url = new URL(trackerUrl);
    // console.log('URL:', url);

    if (url.protocol === 'udp:') {
      // Handle UDP trackers
      const socket = dgram.createSocket('udp4');
      const message = createConnectionRequest();

      socket.send(message, 0, message.length, url.port, url.hostname, (err) => {
        if (err) {
          socket.close();
          return reject(err);
        }
      });

      socket.on('message', (response) => {
        try {
          const peers = parseTrackerResponse(response);
          socket.close();
          resolve(peers);
        } catch (error) {
          socket.close();
          reject(error);
        }
      });

      socket.on('error', (err) => {
        socket.close();
        reject(err);
      });
    } else if (url.protocol === 'http:' || url.protocol === 'https:') {
      // Add required query parameters for HTTP trackers
      const peerId = generatePeerId();

      // Properly encode info_hash as a binary URL-encoded string
      const encodedInfoHash = encodeURIComponent(Buffer.from(infoHash, 'hex').toString('binary'));

      url.searchParams.append('info_hash', encodedInfoHash);
      url.searchParams.append('peer_id', peerId);
      url.searchParams.append('port', '6881');
      url.searchParams.append('uploaded', '0');
      url.searchParams.append('downloaded', '0');
      url.searchParams.append('left', totalSize.toString());
      url.searchParams.append('compact', '1');

      const httpModule = url.protocol === 'http:' ? http : https;

      httpModule.get(url.toString(), (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`HTTP tracker responded with status code ${response.statusCode}`));
        }

        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const trackerResponse = bencode.decode(Buffer.from(data));
            const peers = parseHttpTrackerResponse(trackerResponse);
            resolve(peers);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    } else {
      reject(new Error(`Unsupported tracker protocol: ${url.protocol}`));
    }
  });
};


const parseHttpTrackerResponse = (trackerResponse) => {
  if (!trackerResponse.peers) {
    throw new Error('No peers found in tracker response');
  }

  const peers = [];
  const peersBuffer = trackerResponse.peers;

  for (let i = 0; i < peersBuffer.length; i += 6) {
    const ip = peersBuffer.slice(i, i + 4).join('.');
    const port = peersBuffer.readUInt16BE(i + 4);
    peers.push({ ip, port });
  }

  return peers;
};


const parseTrackerResponse = (response) => {
  const action = response.readUInt32BE(0);
  const transactionId = response.readUInt32BE(4);

  if (action !== 1) {
    throw new Error('Invalid tracker response action');
  }

  const peers = [];
  for (let i = 8; i < response.length; i += 6) {
    const ip = response.slice(i, i + 4).join('.');
    const port = response.readUInt16BE(i + 4);
    peers.push({ ip, port });
  }

  return peers;
};

const encodeBinaryInfoHash = (infoHash) => {
  return Buffer.from(infoHash, 'hex')
    .toString('binary')
    .split('')
    .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
    .join('');
};


const testHttpTrackerConnection = (trackerUrl, infoHash, totalSize) => {
  const url = new URL(trackerUrl);
  const httpModule = url.protocol === 'http:' ? http : https;

  // Add required query parameters
  const peerId = generatePeerId();
  const encodedInfoHash = encodeBinaryInfoHash(infoHash); // Properly encode info_hash in binary format

  url.searchParams.append('info_hash', encodedInfoHash);
  url.searchParams.append('peer_id', peerId);
  url.searchParams.append('port', '6881'); // Example port
  url.searchParams.append('uploaded', '0');
  url.searchParams.append('downloaded', '0');
  url.searchParams.append('left', totalSize.toString());
  url.searchParams.append('compact', '1');

  console.log(`Testing connection to HTTP tracker: ${url.toString()}`);

  httpModule.get(url.toString(), (response) => {
    console.log(`HTTP Tracker Response Status Code: ${response.statusCode}`);
    if (response.statusCode === 200) {
      console.log('HTTP tracker is reachable.');
    } else {
      console.log(`HTTP tracker responded with status code: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error connecting to HTTP tracker: ${err.message}`);
  });
};


(async () => {
  try {
    const torrent = parseTorrentFile(filePath);
    console.log('Fetching peers from tracker...');
    console.log(torrent.announce);
    testHttpTrackerConnection(torrent.announce, torrent.infoHash, torrent.totalSize);    // const peers = await getPeersFromTracker("udp://bt1.archive.org:6969/announce'", torrent.infoHash, torrent.totalSize);
    // const peers = await getPeersFromTracker(torrent.announce, torrent.infoHash, torrent.totalSize);
    // console.log('Peers:', peers);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();