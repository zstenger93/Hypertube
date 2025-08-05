import WebTorrent from 'webtorrent-hybrid';
import fs from 'fs';

const client = new WebTorrent();

// Path to the .torrent file or magnet URI
const torrentPath = './CC_1916_09_04_TheCount_archive.torrent';

client.add(torrentPath, (torrent) => {
  console.log(`Downloading: ${torrent.name}`);

  torrent.files.forEach((file) => {
    console.log(`File: ${file.name}`);
    const stream = fs.createWriteStream(`./downloads/${file.name}`);
    file.createReadStream().pipe(stream);

    stream.on('finish', () => {
      console.log(`Downloaded: ${file.name}`);
    });
  });

  torrent.on('done', () => {
    console.log('Torrent download complete');
    client.destroy(); // Clean up the client
  });
});

client.on('error', (err) => {
  console.error('Error:', err.message);
});


