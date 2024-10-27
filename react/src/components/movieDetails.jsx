import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/watchTheMovie?id=${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");

        const data = await response.json();
        setMovie(data);
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
      <h1>HyperTube</h1>
      {movie ? (
        <div className="movie-details">
          <img src={movie.Poster} alt={movie.Title} />
          <h2>{movie.Title}</h2>
          <p>Year: {movie.Year}</p>
          <p>Genre: {movie.Genre}</p>
          <p>Plot: {movie.Plot}</p>
          <p>Director: {movie.Director}</p>
        </div>
      ) : (
        <p>Movie details not found.</p>
      )}
    </div>
  );
};

export default MovieDetails;
