import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import Logout from "./logout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
// import WebTorrent from "webtorrent";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";

const WatchMovie = () => {
  const { id } = useParams();
  const location = useLocation();
  const { movie } = location.state || {};
  const [torrents, setTorrents] = useState("");
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchTorrent = async () => {
      try {
        const response = await fetch(
          `https://archive.org/advancedsearch.php?q=${id}&fl%5B%5D=identifier&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=50&page=1&output=json&save=yes#raw`
        );
        if (!response.ok) throw new Error("Failed to fetch torrents");
        const data = await response.json();
        if (data.response && data.response.docs && data.response.docs.length > 0) {
          const identifier = data.response.docs[0].identifier;
          setTorrents(identifier);
        } else {
          setTorrents("");
        }
      } catch (error) {
        setTorrents("");
      }
    };
    fetchTorrent();
  }, [id, movie]);

  // useEffect(() => {
  //   if (torrents) {
  //     const client = new WebTorrent();
  //     const torrentId = `https://archive.org/download/${torrents}/${torrents}_archive.torrent`;

  //     client.add(torrentId, (torrent) => {
  //       const file = torrent.files.find((file) => file.name.endsWith(".mp4"));
  //       if (file) {
  //         file.renderTo("video#player");
  //       }
  //     });

  //     return () => {
  //       client.destroy();
  //     };
  //   }
  // }, [torrents]);

  // useEffect(() => {
  //   if (videoRef.current) {
  //     playerRef.current = videojs(videoRef.current, {
  //       controls: true,
  //       autoplay: false,
  //       preload: "auto",
  //     });
  //   }

  //   return () => {
  //     if (playerRef.current) {
  //       playerRef.current.dispose();
  //     }
  //   };
  // }, [videoRef]);

  return (
    <div>
      <Logout />
      <p>Here comes the movies</p>
      <h1>{id}</h1>
      {movie && (
        <div>
          <h2>{movie.Title ?? movie.title}</h2>
          <p>{movie.Plot ?? movie.plot}</p>
          <h3>Torrent Data:</h3>
          <div className="torrentList">
            {torrents !== "" ? (
              <div className="torrentItem">
                <p>Name: {torrents}</p>
                <h2>torrent link: https://archive.org/download/{torrents}/{torrents}_archive.torrent</h2>
                {/* <video
                  id="player"
                  className="video-js vjs-default-skin"
                  ref={videoRef}
                  width="640"
                  height="360"
                  controls
                ></video> */}
              </div>
            ) : (
              <p>No torrents found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchMovie;
