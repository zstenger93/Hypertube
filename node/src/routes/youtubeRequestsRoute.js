import express from "express";
import { client } from "../../index.js";
import axios from "axios";
const router = express.Router();
const youtubeApiKey = process.env.YOUTUBE_KEY;
const count = 3

router.get("/:title", async (req, res) => {
  const { title } = req.params;
  if (!title || title.length === 0) {
    return res.status(400).send("Potato");
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${count}&q=${title}&key=${youtubeApiKey}`;
  try {
    const searchMoviesInDb = `
      SELECT * FROM Movies WHERE LOWER(Title) = LOWER($1) LIMIT 1;
    `;
    const movieResult = await client.query(searchMoviesInDb, [title]);
    if (movieResult.rows.length > 0 && movieResult.rows[0].videos) {
      res.json(movieResult.rows[0].videos);
      return;
    }
    const response = await axios.get(url);
    if (!response.data || !response.data.items || response.data.error) {
      res.status(500).send("Error YouTube API 1");
      return;
    }
    const videos = JSON.stringify(response.data.items);
    await client.query("BEGIN");
    const updateDB = `
      UPDATE Movies
      SET videos = $1
      WHERE LOWER(Title) = LOWER($2)
      RETURNING *;
    `;
    const updateResult = await client.query(updateDB, [videos, title]);
    if (updateResult.rows.length === 0) {
    }
    await client.query("COMMIT");
    res.json(response.data.items);
  } catch (error) {
    await client.query("ROLLBACK");
    res
      .status(500)
      .send("Error YouTube API 2");
  }
});

export default router;
