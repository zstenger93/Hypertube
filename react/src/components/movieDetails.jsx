import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import Logout from "./logout";
import { useNavigate } from "react-router-dom";
import poster from "../assets/poster.jpg";
import { Comments } from "./displayComments";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchYoutube = async (title) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/youtubeRequests/${title}`
      );
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
          `http://localhost:3000/api/watchTheMovie/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");
        const data = await response.json();
        console.log(data);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
		<img src="/Pirate-Flag.svg" alt="Left SVG" style={{ width: '148px', height: '148px', marginRight: '10px' }} />
		<h1 className="lastColor">HyperCrime</h1>
		<img src="/Pirate-Flag.svg" alt="Right SVG" style={{ width: '148px', height: '148px', marginLeft: '10px' }} />
      </div>
      {movie ? (
        <div>
          <div className="movieBox">
            <button
              className="movieFrame1"
              onClick={() => navigate(`/movie/${movie.imdbID}/watch`)}
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
	  <Comments movie={id} />
    </div>
  );
};

export default MovieDetails;
