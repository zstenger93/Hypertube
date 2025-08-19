import express from "express";
import { client } from "../../index.js";
const router = express.Router();

router.post("/:movieId", async (req, res) => {
  const movieId = req.params.movieId;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const { rows } = await client.query(
      "SELECT * FROM Users WHERE oauth = $1",
      [token]
    );
    if (rows.length === 0) return res.sendStatus(403);
    const user = rows[0];
    await client.query("BEGIN");
    const updateClicked = `
      UPDATE Users 
      SET clicked_movies = array_append(clicked_movies, $1) 
      WHERE email = $2 AND NOT ($1 = ANY(clicked_movies));
    `;
    await client.query(updateClicked, [movieId, user.email]);
    const updateClick = `
      UPDATE Movies SET click_count = click_count + 1 WHERE imdbID = $1;
    `;
    await client.query(updateClick, [movieId]);
    await client.query("COMMIT");
    res.status(200).send({ message: "Clicked" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error tracking click:", err);
    res.sendStatus(500);
  }
});

export default router