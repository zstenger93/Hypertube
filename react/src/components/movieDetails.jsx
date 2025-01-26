import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import Logout from "./logout";
import { useNavigate } from "react-router-dom";
import poster from "../assets/poster.jpg";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchYoutube = async (title) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/youtubeRequests?title=${title}`
      );
      console.log(response);
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

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/watchTheMovie?id=${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");
        const data = await response.json();
        setMovie(data);
        if (data.Title ?? data.title) fetchYoutube(data.Title ?? data.title);
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
      <h1>HyperTube</h1>
      {movie ? (
        <div>
          <button onClick={() => navigate(`/movie/${movie.imdbID}/watch`)}>
            <img src={thePoster} alt={movie.Title ?? movie.title} />
          </button>
          <h2>{movie.Title}</h2>
          <p>Year: {movie.Year ?? movie.year}</p>
          <p>Genre: {movie.Genre ?? movie.genre}</p>d
          <p>Plot: {movie.Plot ?? movie.plot}</p>
          <p>Director: {movie.Director ?? movie.director}</p>
          <h3>Related Videos:</h3>
          <div className="videoList">
            {videos.map((video) => (
              <div key={video.id.videoId} className="videoItem">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                  />
                  <p>{video.snippet.title}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Movie details not found.</p>
      )}
    </div>
  );
};

export default MovieDetails;
