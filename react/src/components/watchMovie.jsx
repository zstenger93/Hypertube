import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import Logout from "./logout";
import { useParams, useLocation } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";


// Only handles checking file availability + (re)setting source & retry
const setPlayerSourceWithRetry = async (
  playerRef,
  videoPath,
  setIsBuffering,
  setError,
  id,
  torrents,
  retryCount = 0,
  maxRetries = 10
) => {
  if (!playerRef.current) return;

  try {
    const fileName = `${torrents}_512kb.mp4`;
    const response = await fetch(`/check-file/${id}/${torrents}/${fileName}`);
    const data = await response.json();

    if (data.exists) {
      setIsBuffering(false);
      setError(false);
      // Update source only if different
      const currentSrc = playerRef.current.currentSrc();
      if (!currentSrc || !currentSrc.includes(videoPath)) {
        playerRef.current.src({ src: videoPath, type: "video/mp4" });
        playerRef.current.play().catch(() => {});
      }
    } else {
      if (retryCount < maxRetries) {
        setTimeout(
          () =>
            setPlayerSourceWithRetry(
              playerRef,
              videoPath,
              setIsBuffering,
              setError,
              id,
              torrents,
              retryCount + 1,
              maxRetries
            ),
          5001
        );
      } else {
        setIsBuffering(false);
        setError(true);
      }
    }
  } catch {
    if (retryCount < maxRetries) {
      setTimeout(
        () =>
          setPlayerSourceWithRetry(
            playerRef,
            videoPath,
            setIsBuffering,
            setError,
            id,
            torrents,
            retryCount + 1,
            maxRetries
          ),
        5001
      );
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

  // Fetch torrent / license info
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
          setTorrents(doc.identifier || movie?.title?.replace(/\s/g, "_") || "");
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
    const startTorrentDownload = async () => {
      if (torrents) {
        const torrentLink = `https://archive.org/download/${torrents}/${torrents}_archive.torrent`;
        try {
          const response = await fetch("http://localhost:5001/upload-torrent", {
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

        } catch (error) {
          console.error("Error uploading torrent:", error);
        }
      }
    };

    startTorrentDownload();

  }, [torrents, id]);

  // Initialize player once
  useEffect(() => {
    if (playerRef.current || !videoRef.current) return;

    const videoEl = videoRef.current;

    playerRef.current = videojs(videoEl, {
      controls: true,
      autoplay: true,
      preload: "auto",
      sources: []
    });

    playerRef.current.on("waiting", () => setIsBuffering(true));
    playerRef.current.on("playing", () => setIsBuffering(false));
    playerRef.current.on("error", () => {
      const srcObj = playerRef.current?.currentSource();
      if (!srcObj?.src) return;
      setTimeout(() => {
        if (!playerRef.current || playerRef.current.isDisposed()) return;
        playerRef.current.src(srcObj);
        playerRef.current.play().catch(() => {});
      }, 5001);
    });

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

// Fetch subtitles when torrents ready
useEffect(() => {
  if (!torrents) return;
  const fetchSubtitles = async () => {
    try {
      const validResp = await fetch(`/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      const validUser = await validResp.json();
      const selectedLang = validUser.user.language || "en";
      const response = await fetch(`/movies/subtitles/${id}`);
      if (!response.ok) throw new Error("Failed to fetch subtitles");
      const data = await response.json();
      // Keep only English (handle common variants)
      const englishSubs = (data.data || []).filter(
        item =>
          ["en", "eng", "english", selectedLang].includes(
            item?.attributes?.language?.toLowerCase()
          )
      );
      const subtitleList = englishSubs.map(item => ({
        id: item.id,
        language: item.attributes.language,
        url: `http://localhost:3000/subtitle/${id}/${torrents}/${item.id}.vtt`
      }));
      setSubtitles(subtitleList);
    } catch (e) {
      console.error(e);
    }
  };
  fetchSubtitles();
}, [id, torrents]);

  // Apply subtitles to existing player (remove old, add new)
  useEffect(() => {
    if (!playerRef.current || playerRef.current.isDisposed()) return;
    const player = playerRef.current;
    const tracks = player.remoteTextTracks();
    for (let i = tracks.length - 1; i >= 0; i--) {
      player.removeRemoteTextTrack(tracks[i]);
    }
    subtitles.forEach(subtitle => {
      player.addRemoteTextTrack(
        {
          kind: "subtitles",
          src: subtitle.url,
          srclang: subtitle.language,
          label: subtitle.language
        },
        false
      );
    });
  }, [subtitles]);


  // Set video source (and retry)
  useEffect(() => {
    if (!isPublicorNot || !torrents || !playerRef.current || playerRef.current.isDisposed()) return;
    const videoPath = `http://localhost:3000/stream/${id}/${torrents}/${torrents}_512kb.mp4`;
    setIsBuffering(true);
    setPlayerSourceWithRetry(
      playerRef,
      videoPath,
      setIsBuffering,
      setError,
      id,
      torrents
    );
  }, [isPublicorNot, torrents, id]);

  return (
    <div className="center">
      <Logout />
      <p>Here comes the movies</p>

      {!isPublicorNot && (
        <p>
          This movie is protected by copyright or missing copyright
          information.
        </p>
      )}

      {isPublicorNot && isBuffering && <p>Buffering...</p>}
      {isPublicorNot && error && (
        <p>Error: Unable to load video after multiple attempts.</p>
      )}

      <div
        style={{
          visibility: isPublicorNot && !error ? "visible" : "hidden"
        }}
        data-vjs-player
      >
        <video
          id="player"
          className="video-js vjs-default-skin"
          ref={videoRef}
          width="640"
          height="360"
          controls
        />
      </div>

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