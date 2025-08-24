import express from "express";
import axios from "axios";
import { client } from "../../index.js";
import { justGetUser } from "../utils/validate.js";
import { getMovieFromDB } from "../utils/getMovieFromDb.js";
import { inserMovieInDb } from "../db/insertMovieInDb.js";
const youtubeApiKey = process.env.YOUTUBE_KEY;
const count = 3;

const router = express.Router();
const apiKey = process.env.OMDBAPI_KEY;

function appendWatchedMovies(user, result) {
  if (!user) return result.map((m) => ({ ...m, isWatched: false }));
  const watched = user.watched_movies || [];
  return result.map((movie) => ({
    ...movie,
    isWatched: watched.includes(movie.imdbid || movie.imdbID),
  }));
}

async function getMovies(req, res, user) {
  try {
    const limit = 20;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM Movies ORDER BY year DESC LIMIT $1 OFFSET $2;`;
    const result = await client.query(query, [limit, offset]);
    const newResult = appendWatchedMovies(user, result.rows);
    res.json(newResult);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching movies");
  }
}

async function getMoviesByName(req, res, user) {
  try {
    const limit = 20;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;
    const { title } = req.params;
    const query = `SELECT * FROM Movies WHERE Title ILIKE '%' || $1 || '%' ORDER BY year DESC LIMIT $2 OFFSET $3;`;
    const result = await client.query(query, [title, limit, offset]);
    return appendWatchedMovies(user, result.rows);
  } catch (error) {
    return null;
  }
}

async function fetchYoutube(movie) {
  if (!movie || !movie.Title) return movie;
  const title = movie.Title + " Movie";
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${count}&q=${encodeURIComponent(
    title
  )}&key=${youtubeApiKey}`;
  try {
    const response = await axios.get(url);
    if (!response.data?.items || response.data.items.length === 0) return movie;
    const videosJSON = JSON.stringify(response.data.items);
    await client.query("BEGIN");
    const updateQuery = `
      UPDATE Movies
      SET videos = $1
      WHERE imdbID = $2
      RETURNING *;
    `;
    const result = await client.query(updateQuery, [videosJSON, movie.imdbID]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Proably API TOKEN RUN OUT", error);
    return movie;
  }
}

async function updateClick(movieId) {
  try {
    await client.query("BEGIN");
    const updateClickCount = `UPDATE Movies SET click_count = click_count + 1 WHERE imdbID = $1;`;
    await client.query(updateClickCount, [movieId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
  }
}

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || id.length === 0) {
    return res.status(400).send("Error: Invalid ID");
  }
  try {
    let movie = await getMovieFromDB(id);
    if (movie === null) {
      movie = await inserMovieInDb(id);
    }
    await updateClick(id);
    if (!movie.videos || movie.videos.length === 0) {
      movie = await fetchYoutube(movie);
    }
    return res.json(movie);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error.message);
  }
});

router.get("/:title?", async (req, res) => {
  const { title } = req.params;
  const user = await justGetUser(req, res);
  const page = parseInt(req.query.page, 10) || 1;
  if (!title || title.length < 3) {
    return getMovies(req, res, user);
  }

  try {
    let movieRows = await getMoviesByName(req, res, user);
    if (movieRows !== null && movieRows.length > 0) {
      return res.json(movieRows);
    }
    if (page > 3) {
      return res
        .status(500)
        .send("Need to save API rate Limits so I need to hard cap this ");
    }
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(
      title
    )}&page=${page}`;
    const response = await axios.get(url);
    if (response.data.Response === "False") {
      return res.status(500).send("Movie not found in OMDB API");
    }

    await client.query("BEGIN");
    for (let element of response.data.Search) {
      const movie = {
        title: element.Title,
        poster: element.Poster !== "N/A" ? element.Poster : null,
        imdbID: element.imdbID,
        year: element.Year,
      };

      const insertQuery = `
        INSERT INTO Movies (Title, Year, Genre, Plot, Director, Poster, imdbID, imdbRating, imdbVotes)
        VALUES ($1, $2, NULL, NULL, NULL, $3, $4, NULL, NULL)
        ON CONFLICT (imdbID) DO UPDATE
        SET Poster = COALESCE(EXCLUDED.Poster, Movies.Poster)
        RETURNING *;
      `;
      await client.query(insertQuery, [
        movie.title,
        movie.year,
        movie.poster,
        movie.imdbID,
      ]);
    }
    await client.query("COMMIT");
    movieRows = await getMoviesByName(req, res, user);
    if (movieRows !== null && movieRows.length > 0) {
      return res.json(movieRows);
    }
    return res.status(500).send("No more movies found");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).send("Error fetching data from OMDB API");
  }
});

export default router;
