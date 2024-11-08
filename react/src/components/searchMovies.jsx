import React, { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Logout from "./logout";

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
        console.log(data);
        setResults(data.Search || []);
      } catch (error) {
        console.error("Error fetching data:", error);
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
          results.map((movie) => (
            <button
              key={movie.imdbID}
              className="movieFrame"
              onClick={() => navigate(`/movie/${movie.imdbID}`)}
            >
              <img src={movie.Poster} alt={movie.Title} />
              <h3>{movie.Title}</h3>
              <p>{movie.Year}</p>
            </button>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
