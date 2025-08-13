import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import Logout from "./logout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const startTorrentDownload = async (id, torrents) => {
  const torrentLink = `https://archive.org/download/${torrents}/${torrents}_archive.torrent`;
  try {
    const response = await fetch("http://localhost:5000/upload-torrent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        link: torrentLink,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload torrent");
    }

    const result = await response.json();
    console.log("Torrent uploaded successfully:", result);
  } catch (error) {
    console.error("Error uploading torrent:", error);
  }
};

const initializeVideoPlayer = async (videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, retryCount = 0) => {
  try {
    const fileName = `${torrents}_512kb.mp4`;
    const response = await fetch(`http://localhost:3000/check-file/${id}/${torrents}/${fileName}`);
    const data = await response.json();

    if (data.exists) {
      console.log("File is available. Initializing video player...");
      setIsBuffering(false); // Stop buffering
      setError(false); // Clear any error state

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

        // Add event listeners for buffering
        playerRef.current.on("waiting", () => {
          setIsBuffering(true);
        });

        playerRef.current.on("playing", () => {
          setIsBuffering(false);
        });

        // Retry loading the video if an error occurs
        playerRef.current.on("error", () => {
          console.error("Error loading video. Retrying...");
          setTimeout(() => {
            playerRef.current.src({ src: videoPath, type: "video/mp4" });
            playerRef.current.play();
          }, 5000); // Retry after 5 seconds
        });
      } else {
        // Update the source if the player already exists
        playerRef.current.src({ src: videoPath, type: "video/mp4" });
        playerRef.current.play();
      }
    } else {
      console.log(`File not available yet. Retrying... (Attempt ${retryCount + 1})`);
      setIsBuffering(true); // Show buffering screen

      if (retryCount < 10) { // Retry up to 10 times
        setTimeout(() => initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, retryCount + 1), 5000); // Retry after 5 seconds
      } else {
        console.error("File not available after multiple attempts.");
        setIsBuffering(false); // Stop buffering
        setError(true); // Show error message
      }
    }
  } catch (error) {
    console.error("Error checking file availability:", error);
    setIsBuffering(true); // Show buffering screen

    if (retryCount < 10) { // Retry up to 10 times
      setTimeout(() => initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, retryCount + 1), 5000); // Retry after 5 seconds
    } else {
      console.error("Error checking file availability after multiple attempts.");
      setIsBuffering(false); // Stop buffering
      setError(true); // Show error message
    }
  }
};

const WatchMovie = () => {
  const { id } = useParams();
  const location = useLocation();
  const { movie } = location.state || {};
  const [torrents, setTorrents] = useState("");
  const [isPublicorNot, setIsPublicorNot] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false); // State for buffering
  const [error, setError] = useState(false); // State for error
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchTorrentfile = async () => {
      try {
        const response = await fetch(
          `https://archive.org/advancedsearch.php?q=${id}&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=50&page=1&output=json&save=yes#raw`
        );
        if (!response.ok) throw new Error("Failed to fetch torrents");
        const data = await response.json();
        if (data.response && data.response.docs && data.response.docs[0].licenseurl) {
          if (data.response.docs[0].licenseurl == "http://creativecommons.org/licenses/publicdomain/") {
            setIsPublicorNot(true);
            if (data.response && data.response.docs && data.response.docs[0].identifier) {
              setTorrents(data.response.docs[0].identifier);
            } else {
              setTorrents(movie.title.replace(/\s/g, "_"));
            }
          }
        } else {
          setIsPublicorNot(false);
          setTorrents("");
        }
      } catch (error) {
        setIsPublicorNot(false);
        setTorrents("");
      }
    };
    fetchTorrentfile();
  }, [id, movie]);

  useEffect(() => {
    if (torrents) {
      startTorrentDownload(id, torrents); // Start torrent download in the background
    }
  }, [torrents, id]);

  useEffect(() => {
    if (isPublicorNot && videoRef.current && torrents) {
      const videoPath = `http://localhost:3000/stream/${id}/${torrents}/${torrents}_512kb.mp4`;
      initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents); // Initialize video player with file check
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [isPublicorNot, videoRef, torrents, id]);

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
                <h2>
                  torrent link: https://archive.org/download/{torrents}/{torrents}_archive.torrent
                </h2>
                {isPublicorNot ? (
                  <>
                    {isBuffering && <p>Buffering...</p>} {/* Show buffering indicator */}
                    {error && <p>Error: Unable to load video after multiple attempts.</p>} {/* Show error message */}
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
              </div>
            ) : (
              <p>No torrents found or missing copyright information.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchMovie;