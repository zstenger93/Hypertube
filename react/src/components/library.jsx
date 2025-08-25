import { useEffect, useState } from "react";
import poster from "../assets/poster.jpg";
import { useNavigate } from "react-router-dom";

const Library = ({ list, title }) => {
  const limit = 15;
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!list) return;
    const fetchMovies = async () => {
      try {
        const limitedIds = list.slice(0, limit);
        const responses = await Promise.all(
          limitedIds.map((imdbId) =>
            fetch(`/movies/${imdbId}`).then((res) => res.json())
          )
        );
        setMovies(responses);
      } catch (error) {}
    };
    fetchMovies();
  }, [list]);

  if (!list) {
    return <p>Add memeeeeees here</p>;
  }
  return (
    <div>
      <h1>{title}</h1>
      <div className="displayMovies">
        {movies.length > 0 ? (
          movies.map((movie) => {
            let thePoster =
              movie.Poster && movie.Poster !== "N/A"
                ? movie.Poster
                : movie.poster || poster;
            if (thePoster === "N/A") thePoster = poster;
            return (
              <button
                key={movie.imdbID ?? movie.imdbid}
                className="movieFrame"
                onClick={() => navigate(`/movie/${movie.imdbid}`)}
              >
                <img
                  src={thePoster}
                  alt={movie.Title ?? movie.title}
                  style={{ width: "100%", borderRadius: "8px" }}
                  onError={(e) => (e.target.src = poster)}
                />
                <h3>{movie.Title ?? movie.title}</h3>
                <p>{movie.Year ?? movie.year}</p>
              </button>
            );
          })
        ) : (
          <p>No movies in your library yet</p>
        )}
      </div>
    </div>
  );
};

export default Library;
