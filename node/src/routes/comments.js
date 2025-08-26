import express from "express";
import { client } from "../../index.js";
import { getUserFromToken } from "../utils/validate.js";
const router = express.Router();

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUserFromToken(req, res);
  if (!user) return;
  try {
    const query = `DELETE FROM Comments WHERE comment_id = $1 AND user_email = $2 RETURNING *;`;
    const result = await client.query(query, [id, user.email]);
    if (result.rows.length === 0) return res.status(404).send("Some error");
    return res.status(200).json({ message: "C D", comment: result.rows[0] });
  } catch (error) {
    return res.status(500).send("I eat the chips and I Delete");
  }
});

router.patch("/:id", async (req, res) => {
  const commentId = req.params.id;
  const { text } = req.body;
  if (!text) return res.status(400).send("No text provided for update");
  if (text.length > 500) return res.status(400).send("This is X");
  const user = await getUserFromToken(req, res);
  if (!user) return;
  try {
    const query = `UPDATE Comments SET content = $1 WHERE comment_id = $2 AND user_email = $3 RETURNING *;`;
    const result = await client.query(query, [text, commentId, user.email]);
    if (result.rows.length === 0) return res.status(404).send("Error");
    return res.status(200).json({ message: "U", comment: result.rows[0] });
  } catch (error) {
    return res.status(500).send("Error updating comment");
  }
});

router.post("/:movieId", async (req, res) => {
  const movieId = req.params.movieId;
  if (movieId.length === 0) {
    return res.status(500).send("Error adding comment");
  }
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
    await client.query("COMMIT");
    res.status(200).send({ message: "Comment Added", result: result.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).send("Error adding comment");
  }
});

router.get("/:movieId", async (req, res) => {
  const { movieId } = req.params;
  console.log(movieId);
  if (!movieId || movieId.length === 0) {
    return res.status(400).send("Potato");
  }
  try {
    const searchMovie = `SELECT * FROM Movies WHERE imdbID = $1;`;
    const movieResult = await client.query(searchMovie, [movieId]);
    if (movieResult.rows.length === 0) {
      return res.status(404).send("Movie not found");
    }
    const id = movieResult.rows[0].movie_id;
    const searchComments = `SELECT * FROM Comments WHERE movie_id = $1;`;
    const commentsResult = await client.query(searchComments, [id]);
    for (let comment of commentsResult.rows) {
      const userQuery = `SELECT * FROM Users WHERE email = $1;`;
      const userResult = await client.query(userQuery, [comment.user_email]);
      comment.user = userResult.rows[0];
      comment.user_email = null;
      comment.user.oauth = null;
      comment.user.email = null;
      comment.user.user_email = null;
    }
    res.json(commentsResult.rows);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Error fetching comments");
  }
});

export default router;
