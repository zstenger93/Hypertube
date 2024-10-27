import React, { useState } from "react";
import "../App.css";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleApiRequest = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/movies?title=${value}`
        );
        const data = await response.json();
        setResults(data.Search || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleApiRequest}
      />
      <div className="displayMovies ">
        {results.length > 0 ? (
          results.map((movie, index) => (
            <div key={index} className="movieFrame">
              <img src={movie.Poster} alt={movie.Title} />
              <h3>{movie.Title}</h3>
              <p>{movie.Year}</p>
            </div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
