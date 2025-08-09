import express from 'express';
import { client } from '../../index.js';
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const searchComments = `SELECT * FROM Comments;`;
    const commentsResult = await client.query(searchComments);
    for (let comment of commentsResult.rows) {
      const userQuery = `SELECT * FROM Users WHERE email = $1;`;
      const userResult = await client.query(userQuery, [comment.user_email]);
      comment.user = userResult.rows[0];
      comment.user_email = null;
      comment.user.oauth = null;
      comment.user.email = null;
      comment.user.user_email = null;
      const searchMovie = `SELECT * FROM Movies WHERE movie_id = $1;`;
      const movieResult = await client.query(searchMovie, [comment.movie_id]);
      comment.movieData = movieResult.rows[0];
    }
    res.json(commentsResult.rows);
  } catch (error) {
    res.status(500).send("Error fetching comments");
  }
});

export default router