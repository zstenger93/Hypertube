import React, { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Logout from "./logout";
import poster from "../assets/poster.jpg";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleApiRequest = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/movies?title=${value}`
        );
        const data = await response.json();
        if (data.Search) {
          setResults(data.Search || []);
        } else if (data) {
          setResults(data || []);
        }
        if (data.error) {
          return;
        }
      } catch (error) {
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div className="center">
      <Logout />
      <h1>HyperTube</h1>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleApiRequest}
      />
      <div className="displayMovies ">
        {results.length > 0 ? (
          results.map((movie) => {
            const thePoster =
              movie.Poster && movie.Poster !== "N/A"
                ? movie.Poster
                : movie.poster || poster;
            return (
              <button
                key={movie.imdbID ?? movie.imdbid}
                className="movieFrame"
                onClick={() =>
                  navigate(`/movie/${movie.imdbID ?? movie.imdbid}`)
                }
              >
                <img src={thePoster} alt={movie.Title ?? movie.title} />
                <h3>{movie.Title ?? movie.title}</h3>
                <p>{movie.Year ?? movie.year}</p>
              </button>
            );
          })
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
