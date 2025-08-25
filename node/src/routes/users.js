import express from "express";
import { client } from "../../index.js";
import { justGetUser } from "../utils/validate.js";
const router = express.Router();

async function PatchLanguage(id, body) {
  try {
    if (
      !(
        body.language === "EN" ||
        body.language === "HU" ||
        body.language === "LV"
      )
    )
      return null;
    const query = `UPDATE Users SET language = $1 WHERE user_id = $2 RETURNING language;`;
    const result = await client.query(query, [body.language, id]);
    if (result.rows.length === 0) return null;
    return result.rows[0].language;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function toggleListWatch(movieId, email) {
  try {
    const query = `SELECT watch_list @> ARRAY[$1::VARCHAR] AS state FROM Users WHERE email = $2`;
    const checkResult = await client.query(query, [movieId, email]);
    const isWatch = checkResult.rows[0].state;
    let updateQuery;
    if (isWatch) {
      updateQuery = `UPDATE Users SET watch_list = array_remove(watch_list, $1) WHERE email = $2`;
    } else {
      updateQuery = `UPDATE Users SET watch_list = array_append(watch_list, $1) WHERE email = $2`;
    }
    await client.query(updateQuery, [movieId, email]);
    return !isWatch;
  } catch (error) {
    console.error("ToggleWatchList error:", error);
    return false;
  }
}

async function toggleListWatched(movieId, email) {
  try {
    const query = `SELECT watched_movies @> ARRAY[$1::VARCHAR] AS state FROM Users WHERE email = $2`;
    const checkResult = await client.query(query, [movieId, email]);
    const isWatch = checkResult.rows[0].state;
    let updateQuery;
    if (isWatch) {
      updateQuery = `UPDATE Users SET watched_movies = array_remove(watched_movies, $1) WHERE email = $2`;
    } else {
      updateQuery = `UPDATE Users SET watched_movies = array_append(watched_movies, $1) WHERE email = $2`;
    }
    await client.query(updateQuery, [movieId, email]);
    return !isWatch;
  } catch (error) {
    console.error("ToggleWatchList error:", error);
    return false;
  }
}

async function toggleListLike(movieId, email) {
  try {
    const query = `SELECT liked_movies @> ARRAY[$1::VARCHAR] AS state FROM Users WHERE email = $2`;
    const checkResult = await client.query(query, [movieId, email]);
    const isWatch = checkResult.rows[0].state;
    let updateQuery;
    if (isWatch) {
      updateQuery = `UPDATE Users SET liked_movies = array_remove(watch_list, $1) WHERE email = $2`;
    } else {
      updateQuery = `UPDATE Users SET liked_movies = array_append(watch_list, $1) WHERE email = $2`;
    }
    await client.query(updateQuery, [movieId, email]);
    return !isWatch;
  } catch (error) {
    console.error("ToggleWatchList error:", error);
    return false;
  }
}

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const user = await justGetUser(req, res);
    if (user === null) return res.status(401).send("Invalid Token");
    if (parseInt(user.user_id) !== parseInt(id))
      return res.status(403).send("Forbidden");
    if (body.language !== undefined) {
      const language = await PatchLanguage(id, body);
      if (language) return res.json({ language: language });
      else return res.status(500).send("Something went wrong");
    } else if (body.movieId !== undefined && body.watch !== undefined) {
      const watch = await toggleListWatch(body.movieId, user.email);
      res.json({ isWatch: watch });
    } else if (body.movieId !== undefined && body.like !== undefined) {
      const like = await toggleListLike(body.movieId, user.email);
      return res.json({ isLiked: like });
    } else if (body.movieId !== undefined && body.watched !== undefined) {
      const watced = await toggleListWatched(body.movieId, user.email);
      return res.json({ isWatched: watced });
    } else {
      return res.status(400).send("Probably not allowed action");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || id.length === 0) {
    return res.status(404).send("Potato");
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const authUser = await justGetUser(req, res);
    if (authUser === null) {
      return res.status(401).send("Invalid Token");
    }
    const searchUser = `SELECT * FROM Users WHERE user_id = $1;`;
    const userResults = await client.query(searchUser, [id]);
    if (userResults.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    const user = userResults.rows[0];
    user.oauth = null;
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

export default router;
