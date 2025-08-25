import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import Logout from "./logout";
import { useParams, useLocation } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const initializeVideoPlayer = async (videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, subtitles, retryCount = 0) => {
  try {
    // Ensure the videoRef DOM node exists and is in the DOM
    if (!videoRef.current || !document.body.contains(videoRef.current)) {
      console.warn("The video element is not yet in the DOM.");
      return;
    }

    const fileName = `${torrents}_512kb.mp4`;
    const response = await fetch(`/check-file/${id}/${torrents}/${fileName}`);
    const data = await response.json();

    if (data.exists) {
      setIsBuffering(false);
      setError(false);

      if (!playerRef.current) {
        // Initialize the video.js player
        playerRef.current = videojs(videoRef.current, {
          controls: true,
          autoplay: true,
          preload: "auto",
          sources: [{ src: videoPath, type: "video/mp4" }],
        });

        // Add subtitles to the player
        subtitles.forEach((subtitle) => {
          playerRef.current.addRemoteTextTrack(
            {
              kind: "subtitles",
              src: subtitle.url,
              srclang: subtitle.language,
              label: subtitle.language,
            },
            false
          );
        });

        // Handle buffering and errors
        playerRef.current.on("waiting", () => setIsBuffering(true));
        playerRef.current.on("playing", () => setIsBuffering(false));
        playerRef.current.on("error", () => {
          setTimeout(() => {
            playerRef.current.src({ src: videoPath, type: "video/mp4" });
            playerRef.current.play();
          }, 5000);
        });
      } else {
        // Update the video source if the player already exists
        playerRef.current.src({ src: videoPath, type: "video/mp4" });
        playerRef.current.play();
      }
    } else {
      if (retryCount < 10) {
        setTimeout(() => initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, subtitles, retryCount + 1), 5000);
      } else {
        setIsBuffering(false);
        setError(true);
      }
    }
  } catch (error) {
    if (retryCount < 10) {
      setTimeout(() => initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, subtitles, retryCount + 1), 5000);
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
  const [subtitles, setSubtitles] = useState([]);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchSubtitles = async (id, torrents) => {
      try {
        const response = await fetch(`/movies/subtitles/${id}`); // Call the backend route
        if (!response.ok) throw new Error("Failed to fetch subtitles");
        const data = await response.json();

        // Map subtitle data to a usable format
        const subtitleList = data.data.map((item) => ({
          id: item.id,
          language: item.attributes.language,
          url: `http://localhost:3000/stream/${id}/${torrents}/subtitles/${item.id}`,
        }));
        setSubtitles(subtitleList);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSubtitles(id, torrents);
  }, [id, torrents]);

  useEffect(() => {
    const fetchTorrentFile = async () => {
      try {
        const response = await fetch(
          `https://archive.org/advancedsearch.php?q=${id}&rows=50&page=1&output=json`
        );
        if (!response.ok) throw new Error("Failed to fetch torrents");
        const data = await response.json();
        const doc = data.response?.docs?.[0];
        if (
          doc?.licenseurl ===
          "http://creativecommons.org/licenses/publicdomain/"
        ) {
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
  
      // Wait for the DOM to fully render the video element
      const timeout = setTimeout(() => {
        initializeVideoPlayer(videoRef, playerRef, videoPath, setIsBuffering, setError, id, torrents, subtitles);
      }, 0);
  
      return () => {
        clearTimeout(timeout);
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null; // Reset the player reference
        }
      };
    }
  }, [isPublicorNot, videoRef, torrents, id, subtitles]);

  return (
    <div className="center">
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
        <p>
          This movie is protected by copyright or missing copyright information.
        </p>
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
