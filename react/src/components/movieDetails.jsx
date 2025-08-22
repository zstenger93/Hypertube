import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import Logout from "./logout";
import { useNavigate } from "react-router-dom";
import poster from "../assets/poster.jpg";
import { Comments } from "./displayComments";
import { getCookie } from "../utils/cookie";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);
  const [watch, setWatch] = useState(false);
  const [liked, setLiked] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const fetchYoutube = async (title) => {
    try {
      const response = await fetch(`/youtubeRequests/${title}`);
      if (!response.ok) throw new Error("Failed to fetch youtube video");
      const data = await response.json();
      if (data.items) {
        setVideos(data.items);
      } else if (data) {
        setVideos(data);
      }
    } catch (error) {
      setVideos([]);
    }
  };

  const fetchState = async (title) => {
    try {
      const state = await fetch(`/state/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      if (!state.ok) throw new Error("Failed to get state");
      const stateData = await state.json();
      setWatched(stateData.isWatched);
      setWatch(stateData.isWatch);
      setLiked(stateData.isLiked);
    } catch {
      setWatched(false);
      setWatch(false);
      setLiked(false);
    }
  };

  const handleWatched = async () => {
    try {
      const response = await fetch(`/watched/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      if (!response.ok) throw new Error("No Match In Array ");
      const data = await response.json();
      setWatched(data.isWatched);
    } catch (error) {
      setWatched(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/like/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });

      if (!response.ok) throw new Error("No Match In Array");
      const data = await response.json();
      setLiked(data.isLiked);
    } catch (error) {
      setLiked(false);
    }
  };

  const handleWatch = async () => {
    try {
      const response = await fetch(`/watch/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      if (!response.ok) throw new Error("No Match In Array");
      const data = await response.json();
      setWatch(data.isWatch);
    } catch (error) {
      setWatch(false);
    }
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const validResp = await fetch(`/auth/validate`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        });
        console.log(validResp);
        if (!validResp.ok) {
          navigate("/404");
          return;
        }
        const validUser = await validResp.json();
        setUser(validUser);
        const response = await fetch(`/watchTheMovie/${id}`);
        if (!response.ok) {
          navigate("/404");
          return;
        }
        const data = await response.json();
        setMovie(data);
        if (data.Title ?? data.title) fetchYoutube(data.Title ?? data.title);
        await fetch(`/click/${id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        });
        fetchState();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  let thePoster =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : movie.poster || poster;
  if (thePoster === "N/A") {
    thePoster = poster;
  }
  return (
    <div className="center">
      <Logout />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/Pirate-Flag.svg"
          alt="Left SVG"
          style={{ width: "148px", height: "148px", marginRight: "10px" }}
        />
        <h1 className="lastColor">HyperCrime</h1>
        <img
          src="/Pirate-Flag.svg"
          alt="Right SVG"
          style={{ width: "148px", height: "148px", marginLeft: "10px" }}
        />
      </div>
      {movie ? (
        <div>
          <div className="movieBox">
            <button
              className="movieFrame1"
              onClick={() =>
                navigate(`/movie/${id}/watch`, { state: { movie } })
              }
            >
              <img src={thePoster} alt={movie.Title ?? movie.title} />
            </button>
            <div className="anotherColor">
              <h2>{movie.Title ?? movie.title}</h2>
              <h3>{movie.Plot ?? movie.plot}</h3>
              <p>Year: {movie.Year ?? movie.year}</p>
              <p>Genre: {movie.Genre ?? movie.genre}</p>
              <p>Director: {movie.Director ?? movie.director}</p>
              <p>IMDB Raiting: {movie.imdbRating ?? movie.imdbrating}</p>
              <div>
                {liked ? (
                  <button onClick={() => handleLike()}> Liked </button>
                ) : (
                  <button onClick={() => handleLike()}> Not Liked </button>
                )}
                {watched ? (
                  <button onClick={() => handleWatched()}> Watched </button>
                ) : (
                  <button onClick={() => handleWatched()}> Not Watched </button>
                )}
                {watch ? (
                  <button onClick={() => handleWatch()}>
                    Remove From Watch List
                  </button>
                ) : (
                  <button onClick={() => handleWatch()}> Watch List </button>
                )}
              </div>
            </div>
          </div>
          <h3>Related Videos:</h3>
          <div className="videoList">
            {videos.slice(0, 3).map((video, index) => (
              <div
                key={video.id?.videoId || `video-${index}`}
                className="videoItem"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${video.id?.videoId}`}
                  title={video.snippet?.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Movie details not found.</p>
      )}
      <Comments movie={id} currentUser={user} />
    </div>
  );
};

export default MovieDetails;
