import express from "express";
import { client } from "../../index.js";
import { getUserFromToken } from "../utils/validate.js";

const router = express.Router();

router.post("/:movieId", async (req, res) => {
  const movieId = req.params.movieId;
  const user = await getUserFromToken(req, res);
  if (!user) return;
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
    const result = await client.query(insertQuery, [user.email, id, text]);
    result.rows;
    await client.query("COMMIT");
    res.status(200).send({ message: "Comment Added" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).send("Error adding comment");
  }
});

export default router;
