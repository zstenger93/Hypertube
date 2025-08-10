import express from "express";
import { client } from "../../index.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const fetchAllMovies = `
        SELECT * FROM Movies LIMIT 50;
      `;
    const movieResult = await client.query(fetchAllMovies);
    res.json(movieResult.rows);
  } catch (error) {
    res.status(500).send("Error");
  }
});

export default router;
