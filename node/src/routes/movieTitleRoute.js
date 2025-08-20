import express from "express";
import axios from "axios";
import { client } from "../../index.js";
const router = express.Router();
const apiKey = process.env.OMDBAPI_KEY;

router.get("/:title", async (req, res) => {
  const { title } = req.params;
  if (!title || title.length === 0) {
    try {
      const fetchAllMovies = `
        SELECT * FROM Movies LIMIT 50;
      `;
      const movieResult = await client.query(fetchAllMovies);
      res.json(movieResult.rows);
    } catch (error) {
      res.status(500).send("Error fetching movies");
    }
    return;
  }
  if (title.length < 3) {
    try {
      const searchMoviesInDb = `
      SELECT * FROM Movies WHERE Title ILIKE '%' || $1 || '%';
    `;
      const movieResult = await client.query(searchMoviesInDb, [title]);
      if (movieResult.rows.length > 0) {
        res.json(movieResult.rows);
        return;
      }
      return res.json([]);
    } catch {
      return res.json([]);
    }
  }
  try {
    const searchMoviesInDb = `
    SELECT * FROM Movies WHERE Title ILIKE '%' || $1 || '%';
  `;
    const movieResult = await client.query(searchMoviesInDb, [title]);
    if (movieResult.rows.length > 0) {
      res.json(movieResult.rows);
      return;
    }
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${title}`;
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
      SET 
        Poster = COALESCE(EXCLUDED.Poster, Movies.Poster)
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
    res.json(response.data);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data from OMDB API");
  }
});

export default router;