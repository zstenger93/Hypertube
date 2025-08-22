import express from "express";
import { client } from "../../index.js";
import axios from "axios";
import { getMovieFromDB } from "../utils/getMovieFromDb.js";
const router = express.Router();
const apiKey = process.env.OMDBAPI_KEY;

async function inserMovieInDb(id) {
  const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`;
  const response = await axios.get(url);
  if (response.data.Response === "False") {
    throw new Error("Movie not found in OMDB API");
  }
  const movieData = {
    title: response.data.Title ?? "N/A",
    year: response?.data?.Year ?? "N/A",
    genre: response.data.Genre ?? "N/A",
    plot: response.data.Plot ?? "N/A",
    director: response.data.Director ?? "N/A",
    poster: response.data.Poster === "N/A" ? null : response.data.Poster,
    imdbID: response.data.imdbID ?? "N/A",
    imdbRating: response.data.imdbRating ?? "N/A",
    imdbVotes: response.data.imdbVotes ?? "N/A",
  };
  await client.query("BEGIN");
  const insertQuery = `
    INSERT INTO Movies (Title, Year, Genre, Plot, Director, Poster, imdbID, imdbRating, imdbVotes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (imdbID) DO UPDATE 
    SET 
      Title = EXCLUDED.Title,
      Year = EXCLUDED.Year,
      Genre = EXCLUDED.Genre,
      Plot = EXCLUDED.Plot,
      Director = EXCLUDED.Director,
      Poster = EXCLUDED.Poster,
      imdbRating = EXCLUDED.imdbRating,
      imdbVotes = EXCLUDED.imdbVotes
    RETURNING *;
  `;

  const insertResult = await client.query(insertQuery, [
    movieData.title,
    movieData.year,
    movieData.genre,
    movieData.plot,
    movieData.director,
    movieData.poster,
    movieData.imdbID,
    movieData.imdbRating,
    movieData.imdbVotes,
  ]);
  insertResult.rows;
  await client.query("COMMIT");
  return insertResult.rows[0];
}

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || id.length === 0) {
    return res.status(400).send("Error: Invalid ID");
  }
  try {
    const resp = await getMovieFromDB(id);
    if (resp !== null) {
      return res.json(resp);
    }
    const newMovie = await inserMovieInDb(id);
    return res.json(newMovie);
  } catch (error) {
    return res.status(404).send(error.message);
  }
});
export default router;
