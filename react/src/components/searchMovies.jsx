import React, { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Logout from "./logout";
import poster from "../assets/poster.jpg";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState("year");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialMovies = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/movies`);
        const data = await response.json();
        if (data.Search) {
          setResults(data.Search || []);
        } else if (data) {
          setResults(data || []);
        }
      } catch (error) {
        setResults([]);
      }
    };

    fetchInitialMovies();
  }, []);

  const handleApiRequest = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/movies/${value}`
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
      try {
        const response = await fetch(`http://localhost:3000/api/movies`);
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
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredResults = results.sort((a, b) => {
    if (filter === "year") {
      return (b.Year ?? b.year) - (a.Year ?? a.year);
    } else if (filter === "imdbRating") {
      return (b.imdbRating ?? b.imdbrating) - (a.imdbRating ?? a.imdbrating);
    }
    return 0;
  });

  return (
    <div className="center">
      <div className="searchBox">
        <Logout />
        <h1 className="lastColor">HyperCrime</h1>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          className="searchInput"
          onChange={handleApiRequest}
        />
        <select value={filter} onChange={handleFilterChange}>
          <option value="year">Year</option>
          <option value="imdbRating">IMDb Rating</option>
        </select>
      </div>
      <div className="displayMovies ">
        {filteredResults.length > 0 ? (
          filteredResults.map((movie) => {
            let thePoster =
              movie.Poster && movie.Poster !== "N/A"
                ? movie.Poster
                : movie.poster || poster;
            if (thePoster === "N/A") {
              thePoster = poster;
            }
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