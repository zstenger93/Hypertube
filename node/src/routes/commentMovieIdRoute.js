import express from 'express';
import { client } from '../../index.js';
const router = express.Router();

router.get("/:movieId", async (req, res) => {
  const { movieId } = req.params;
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

export default router