import "../App.css";
import Logout from "./logout";
import React, { useState, useRef } from 'react';
import axios from 'axios';

const WatchMovie = () => {
  const [query, setQuery] = useState('');
  const [torrents, setTorrents] = useState([]);
  const videoRef = useRef(null);

  const searchTorrents = async () => {
    const response = await axios.get(`/api/search?query=${query}`);
    setTorrents(response.data);
  };

  const downloadTorrent = async (magnetURI) => {
    await axios.get(`/api/download?magnetURI=${encodeURIComponent(magnetURI)}`);
    if (videoRef.current) {
      videoRef.current.src = `http://localhost:3000/api/stream`;
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a movie"
      />
      <button onClick={searchTorrents}>Search</button>
      <ul>
        {torrents.map((torrent) => (
          <li key={torrent.magnet}>
            {torrent.title}
            <button onClick={() => downloadTorrent(torrent.magnet)}>Watch Movie</button>
          </li>
        ))}
      </ul>
      <video ref={videoRef} controls autoPlay style={{ width: '100%' }} />
    </div>
  );
};

export default WatchMovie;