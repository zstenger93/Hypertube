import React, { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Logout from "./logout";
import poster from "../assets/poster.jpg";
import icantmeme from "../assets/icantmeme.jpg";
import { getCookie } from "../utils/cookie";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreConent, moreConent] = useState(true);
  const [filter, setFilter] = useState("year");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchInitialMovies = async () => {
      setLoading(true);
      try {
        const token = getCookie("accessToken");
        const url = `/movies/${encodeURIComponent(query)}?page=${page}`;
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        const content = data.results || data || [];
        if (content.length === 0) {
          moreConent(false);
          return;
        }
        if (data) {
          moreConent(true);
          setResults((prev) => {
            const mergedResults = [...prev, ...data];
            const uniqueMergedResults = [
              ...new Map(
                mergedResults.map((merged) => [merged.imdbid, merged])
              ).values(),
            ];
            return uniqueMergedResults;
          });
        } else {
          moreConent(false);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchInitialMovies();
  }, [page, query]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMoreConent || loading) return;
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      )
        setPage((prev) => prev + 1);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMoreConent, loading]);

  const handleApiRequest = (e) => {
    const value = e.target.value;
    setQuery(value);
    setResults([]);
    moreConent(true);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const onErrorImage = (e) => {
    if (
      !e.target.complete ||
      e.target.naturalHeight < 50 ||
      e.target.naturalWidth < 50
    ) {
      e.target.src = poster;
    }
  };

  const filteredResults = results.sort((a, b) => {
    if (filter === "year") {
      return (b.Year ?? b.year) - (a.Year ?? a.year);
    } else if (filter === "imdbRating") {
      return (b.imdbRating ?? b.imdbrating) - (a.imdbRating ?? a.imdbrating);
    } else if (filter === "alphabetical") {
      const titleA = (a.Title ?? a.title ?? "").toLowerCase();
      const titleB = (b.Title ?? b.title ?? "").toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    }
    return 0;
  });

  return (
    <div className="center">
      <div className="searchBox">
        <Logout />
        <div className="center">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="Pirate-Flag.svg"
              alt="Left SVG"
              style={{ width: "148px", height: "148px", marginRight: "10px" }}
            />
            <h1 className="lastColor">HyperCrime</h1>
            <img
              src="Pirate-Flag.svg"
              alt="Right SVG"
              style={{ width: "148px", height: "148px", marginLeft: "10px" }}
            />
          </div>
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
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
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
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={thePoster}
                    alt={movie.Title ?? movie.title}
                    style={{ width: "100%", borderRadius: "8px" }}
                    onError={onErrorImage}
                  />
                  {movie.isWatched && (
                    <img
                      src={icantmeme}
                      alt="Watched overlay"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.3,
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "8px",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "16px",
                    }}
                  >
                    <span style={{ marginRight: "5px" }}>📈</span>{" "}
                    {movie.click_count}
                  </div>
                </div>
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
