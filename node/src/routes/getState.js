import express from "express";
import { client } from "../../index.js";
const router = express.Router();

router.get("/:movieId", async (req, res) => {
  const movieId = req.params.movieId;
  let userData = null;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const searchToken = `SELECT * FROM Users WHERE oauth = $1;`;
    const result = await client.query(searchToken, [token]);
    if (result.rows.length !== 0) {
      userData = result.rows[0];
    }
  } catch (error) {
    return res.sendStatus(500);
  }
  if (!userData) return res.sendStatus(403);
  await client.query("BEGIN");
  try {
    const searchMovie = `SELECT * FROM Movies WHERE imdbID = $1;`;
    const movieResult = await client.query(searchMovie, [movieId]);
    if (movieResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Movie not found");
    }
    const isWatchSearch = `
      SELECT watch_list @> ARRAY[$1::VARCHAR] AS state 
      FROM Users WHERE email = $2
    `;
    const isWatchedSearch = `
    SELECT watched_movies @> ARRAY[$1::VARCHAR] AS state 
    FROM Users WHERE email = $2
    `;
    const isLikedSearch = `
    SELECT liked_movies @> ARRAY[$1::VARCHAR] AS state 
    FROM Users WHERE email = $2
    `;
    const checkResultWatch = await client.query(isWatchSearch, [
      movieId,
      userData.email,
    ]);
    const checkResultWatched = await client.query(isWatchedSearch, [
      movieId,
      userData.email,
    ]);
    const checkLikedSearch = await client.query(isLikedSearch, [
      movieId,
      userData.email,
    ]);
    const Watch = checkResultWatch.rows[0].state;
    const Watched = checkResultWatched.rows[0].state;
    const Liked = checkLikedSearch.rows[0].state;
    res.status(200).send({
      isWatched: Watched,
      isLiked: Liked,
      isWatch: Watch,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error", error);
    res.status(500).send("Error");
  }
});

export default router;
