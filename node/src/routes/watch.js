import express from "express";
import { client } from "../../index.js";
const router = express.Router();

router.post("/:movieId", async (req, res) => {
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
    const isWatchedSearch = `
      SELECT watch_list @> ARRAY[$1::VARCHAR] AS is_watched 
      FROM Users WHERE email = $2
    `;
    const checkResult = await client.query(isWatchedSearch, [
      movieId,
      userData.email,
    ]);
    const isWatched = checkResult.rows[0].is_watched;
    let updateDB;
    if (isWatched) {
      updateDB = `
        UPDATE Users 
        SET watch_list = array_remove(watch_list, $1)
        WHERE email = $2
      `;
    } else {
      updateDB = `
        UPDATE Users 
        SET watch_list = array_append(watch_list, $1)
        WHERE email = $2
      `;
    }
    await client.query(updateDB, [movieId, userData.email]);
    await client.query("COMMIT");
    res.status(200).send({
      isWatched: isWatched,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error", error);
    res.status(500).send("Error");
  }
});

export default router