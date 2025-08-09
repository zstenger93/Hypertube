import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import Logout from "./logout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const WatchMovie = () => {
  const { id } = useParams();
  const location = useLocation();
  const { movie } = location.state || {};
  const [torrents, setTorrents] = useState("");
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchTorrentfile = async () => {
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
    fetchTorrentfile();
  }, [id, movie]);

  useEffect(() => {
    const startTorrentDownload = async () => {
      if (torrents) {
        const torrentLink = `https://archive.org/download/${torrents}/${torrents}_archive.torrent`;
        try {
          const response = await fetch("http://localhost:5000/upload-torrent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              'id': id,
              'link': torrentLink,
            }),
          });
  
          if (!response.ok) {
            throw new Error("Failed to upload torrent");
          }
  
          const result = await response.json();
          console.log("Torrent uploaded successfully:", result);
  
          // Initialize video.js player
          if (videoRef.current) {
            const videoPath = `http://localhost:3000/stream/testmovie_short.mp4`; // Adjust filename if necessary
            if (!playerRef.current) {
              playerRef.current = videojs(videoRef.current, {
                controls: true,
                autoplay: true,
                preload: "auto",
                sources: [
                  {
                    src: videoPath,
                    type: "video/mp4",
                  },
                ],
              });
            } else {
              // Update the source if the player already exists
              playerRef.current.src({ src: videoPath, type: "video/mp4" });
              playerRef.current.play();
            }
          }
        } catch (error) {
          console.error("Error uploading torrent:", error);
        }
      }
    };
  
    startTorrentDownload();
  
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [torrents, id]);

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
                <video
                  id="player"
                  className="video-js vjs-default-skin"
                  ref={videoRef}
                  width="640"
                  height="360"
                  controls
                ></video>
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