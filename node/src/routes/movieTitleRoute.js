import express from "express";
import axios from "axios";
import { client } from "../../index.js";
import { justGetUser } from "../utils/validate.js";

const router = express.Router();
const apiKey = process.env.OMDBAPI_KEY;

async function getMovies(req, res, user) {
  try {
    const limit = 20;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM Movies ORDER BY year DESC LIMIT $1 OFFSET $2;`;
    const result = await client.query(query, [limit, offset]);
    res.json(result.rows);
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
    return result.rows;
  } catch (error) {
    return null;
  }
}

router.get("/:title?", async (req, res) => {
  const { title } = req.params;
  const user = await justGetUser();
  const page = parseInt(req.query.page, 10) || 1;

  if (!title || title.length < 3) {
    return getMovies(req, res, user);
  }

  try {
    let movieRows = await getMoviesByName(req, res, user);
    if (movieRows !== null && movieRows.length > 0) {
      return res.json(movieRows);
    }
    if (page > 5) {
      return res
        .status(404)
        .send("Need to save API rate Limits so I need to hard cap this ");
    }
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(
      title
    )}&page=${page}`;
    const response = await axios.get(url);
    if (response.data.Response === "False") {
      return res.status(404).send("Movie not found in OMDB API");
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
    return res.status(404).send("No movies found");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).send("Error fetching data from OMDB API");
  }
});

export default router;
