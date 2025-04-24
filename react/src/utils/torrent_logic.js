// npm install bencode
import fs from 'fs';
import bencode from 'bencode';
import https from 'https'; // Import the https module
import path from 'path'; // Import the path module

const parseTorrentFile = (filePath) => {
  const torrent = bencode.decode(fs.readFileSync(filePath));
  const asciiNumbers = torrent.announce.toString().split(',').map(Number);
  const trackerUrl = asciiNumbers.map((num) => String.fromCharCode(num)).join('');
  return {
    announce: trackerUrl,
    info: torrent.info,
    pieceLength: torrent.info['piece length'],
    pieces: torrent.info.pieces,
    files: torrent.info.files.map(file => ({
      length: file.length,
      path: file.path.map(p => p.toString()).join('/')
    }))
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

import dgram from 'dgram';
import { URL } from 'url';

const getPeersFromTracker = (trackerUrl) => {
  const url = new URL(trackerUrl);
  const socket = dgram.createSocket('udp4');

  const message = Buffer.from(/* tracker request message */);

  socket.send(message, 0, message.length, url.port, url.hostname, (err) => {
    if (err) console.error(err);
  });

  socket.on('message', (response) => {
    // Parse response to get peer list
    const peers = parseTrackerResponse(response);
    socket.close();
    return peers;
  });
};


try {
  const torrent = parseTorrentFile(filePath);
  console.log(torrent);
  console.log('Fetching peers from tracker...');
  console.log(torrent.announce);
  const peers = getPeersFromTracker(torrent.announce);
  console.log(peers);
} catch (error) {
  console.error('Error parsing torrent file:', error.message);
}