import express from "express";
import { client } from "../../index.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let inputPage = req.query.page;
    const limit = 20;
    const page = parseInt(inputPage, 10) || 1;
    const offset = (page - 1) * limit + 1;
    console.log(limit, offset);
    const fetchMoviesFromLimitToLimit = `
        SELECT * FROM Movies
        ORDER BY year DESC
        LIMIT $1 OFFSET $2;
      `;
    const movieResult = await client.query(fetchMoviesFromLimitToLimit, [
      limit,
      offset,
    ]);
    res.json(movieResult.rows);
  } catch (error) {
    res.status(500).send("Error");
  }
});

export default router;
