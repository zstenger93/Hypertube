import express from "express";
import { client } from "../../index.js";
const router = express.Router();

router.post("/:movieId", async (req, res) => {
  const movieId = req.params.movieId;
  var userData = null;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const searchToken = `SELECT * FROM Users WHERE oauth = $1;`;
    const result = await client.query(searchToken, [token]);
    if (result.rows.length !== 0) {
      userData = result.rows[0];
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.sendStatus(500);
  }
  if (!userData) return res.sendStatus(403);
  const { text } = req.body;
  await client.query("BEGIN");
  try {
    const searchMovie = `SELECT * FROM Movies WHERE imdbID = $1;`;
    const movieResult = await client.query(searchMovie, [movieId]);
    if (movieResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Movie not found");
    }
    const id = movieResult.rows[0].movie_id;
    const insertQuery = `INSERT INTO Comments (user_email, movie_id, content) VALUES ($1, $2, $3) RETURNING *;`;
    const result = await client.query(insertQuery, [userData.email, id, text]);
    result.rows;
    await client.query("COMMIT");
    res.status(200).send({ message: "Comment Added" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).send("Error adding comment");
  }
});

export default router