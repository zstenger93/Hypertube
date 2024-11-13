import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import Logout from "./logout";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchYoutube = async (title) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/youtubeRequests?title=${title}`
      );
      if (!response.ok) throw new Error("Failed to fetch youtube video");
      const data = await response.json();
      setVideos(data.items);
    } catch (error) {
      console.error("Error fetching youtube video:", error);
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
        if (data.Title) fetchYoutube(data.Title);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  return (
    <div className="center">
      <Logout />
      <h1>HyperTube</h1>
      {movie ? (
        <div>
          <img src={movie.Poster} alt={movie.Title} />
          <h2>{movie.Title}</h2>
          <p>Year: {movie.Year}</p>
          <p>Genre: {movie.Genre}</p>
          <p>Plot: {movie.Plot}</p>
          <p>Director: {movie.Director}</p>
          <p>Ranking :</p>
          <p>ImDB ranking: {movie.imdbRating}</p>
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
