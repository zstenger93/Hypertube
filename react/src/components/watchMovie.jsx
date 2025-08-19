import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import Logout from "./logout";
import { useParams, useLocation } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const initializeVideoPlayer = async (videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, retryCount = 0) => {
  try {
    const fileName = `${torrents}_512kb.mp4`;
    const response = await fetch(`http://localhost:3000/check-file/${id}/${torrents}/${fileName}`);
    const data = await response.json();

    if (data.exists) {
      setIsBuffering(false);
      setError(false);

      if (!playerRef.current) {
        playerRef.current = videojs(videoRef.current, {
          controls: true,
          autoplay: true,
          preload: "auto",
          sources: [{ src: videoPath, type: "video/mp4" }],
        });

        playerRef.current.on("waiting", () => setIsBuffering(true));
        playerRef.current.on("playing", () => setIsBuffering(false));
        playerRef.current.on("error", () => {
          setTimeout(() => {
            playerRef.current.src({ src: videoPath, type: "video/mp4" });
            playerRef.current.play();
          }, 5000);
        });
      } else {
        playerRef.current.src({ src: videoPath, type: "video/mp4" });
        playerRef.current.play();
      }
    } else {
      if (retryCount < 10) {
        setTimeout(() => initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, retryCount + 1), 5000);
      } else {
        setIsBuffering(false);
        setError(true);
      }
    }
  } catch (error) {
    if (retryCount < 10) {
      setTimeout(() => initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, retryCount + 1), 5000);
    } else {
      setIsBuffering(false);
      setError(true);
    }
  }
};

const WatchMovie = () => {
  const { id } = useParams();
  const location = useLocation();
  const { movie } = location.state || {};
  const [torrents, setTorrents] = useState("");
  const [isPublicorNot, setIsPublicorNot] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchTorrentFile = async () => {
      try {
        const response = await fetch(
          `https://archive.org/advancedsearch.php?q=${id}&rows=50&page=1&output=json`
        );
        if (!response.ok) throw new Error("Failed to fetch torrents");
        const data = await response.json();
        const doc = data.response?.docs?.[0];
        if (doc?.licenseurl === "http://creativecommons.org/licenses/publicdomain/") {
          setIsPublicorNot(true);
          setTorrents(doc.identifier || movie.title.replace(/\s/g, "_"));
        } else {
          setIsPublicorNot(false);
          setTorrents("");
        }
      } catch {
        setIsPublicorNot(false);
        setTorrents("");
      }
    };
    fetchTorrentFile();
  }, [id, movie]);

  useEffect(() => {
    if (isPublicorNot && videoRef.current && torrents) {
      const videoPath = `http://localhost:3000/stream/${id}/${torrents}/${torrents}_512kb.mp4`;
      initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents);
      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
        }
      };
    }
  }, [isPublicorNot, videoRef, torrents, id]);

  return (
    <div>
      <Logout />
      <p>Here comes the movies</p>
      {isPublicorNot ? (
        <>
          {isBuffering && <p>Buffering...</p>}
          {error && <p>Error: Unable to load video after multiple attempts.</p>}
          {!error && (
            <video
              id="player"
              className="video-js vjs-default-skin"
              ref={videoRef}
              width="640"
              height="360"
              controls
            ></video>
          )}
        </>
      ) : (
        <p>This movie is protected by copyright or missing copyright information.</p>
      )}
      {movie && (
        <div>
          <h2>{movie.Title ?? movie.title}</h2>
          <p>{movie.Plot ?? movie.plot}</p>
        </div>
      )}
    </div>
  );
};

export default WatchMovie;