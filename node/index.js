import pg from "pg";
import express, { request } from "express";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";
import fs from "fs";
import TorrentSearchApi from 'torrent-search-api';
import { exec } from 'child_process';
import path from 'path';
import { profile } from "console";
import { parse } from "path";
import { fileURLToPath } from "url";

const intraSecret = process.env.INTRA_SECRET;
const intraUUID = process.env.INTRA_UUID;
const redirectURI = process.env.REDIRECT_URI;
const ip = process.env.IP;
const apiKey = process.env.OMDBAPI_KEY;
const youtubeApiKey = process.env.YOUTUBE_KEY;

const { Client } = pg;

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

async function dropTables() {
  await client.query("BEGIN");
  await client.query(`
    DROP TABLE IF EXISTS public.Comments CASCADE;
  `);
  await client.query(`
    DROP TABLE IF EXISTS public.Movies CASCADE;
  `);
  await client.query(`
    DROP TABLE IF EXISTS public.Users CASCADE;
  `);
  await client.query("COMMIT");
  console.log("Dropped tables");
}
async function createTables() {
  try {
    //await dropTables();
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.Users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        surename VARCHAR(100) NOT NULL,
        watched_movies VARCHAR(50)[],
        watch_list VARCHAR(50)[],
        liked_movies VARCHAR(50)[],
        email VARCHAR(100) UNIQUE NOT NULL,
        profile_pic VARCHAR(255),
        oauth VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `);
    console.log("Created Users");
    await client.query("COMMIT");
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.Movies (
          movie_id SERIAL PRIMARY KEY,
          Title VARCHAR(255) NOT NULL,
          Year TEXT,
          Genre VARCHAR(100),
          Plot TEXT,
          Director VARCHAR(100),
          Poster VARCHAR(255),
          imdbID VARCHAR(255) UNIQUE,
          imdbRating VARCHAR(10),
          imdbVotes VARCHAR(20),
          videos JSON,
          click_count INT DEFAULT 0,
          comment_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created Movies");
    await client.query("COMMIT");
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.Comments (
          comment_id SERIAL PRIMARY KEY,
          user_email VARCHAR(100) REFERENCES Users(email) ON DELETE CASCADE,
          movie_id INT REFERENCES Movies(movie_id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created Comments");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating tables:", error);
  }
}

async function checkUser(email) {
  try {
    const query = `SELECT * FROM Users WHERE email = $1`;
    const result = await client.query(query, [email]);
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

async function addUser(userData) {
  try {
    await client.query("BEGIN");
    const query = `
    INSERT INTO Users (username, email, profile_pic, oauth, name, surename) 
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `;
    let values = [
      userData.login ?? userData.displayName ?? "Anonymous",
      userData.email ?? "No email provided",
      userData.image?.versions?.medium ?? null,
      crypto.randomBytes(32).toString("hex"),
      userData.first_name ?? "Anonymous",
      userData.last_name ?? "Anonymous",
    ];
    const result = await client.query(query, values);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding user:", error);
    return null;
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyDdCQbBKuVCKAR67luHVd_WyxpEGVvRfNI",
  authDomain: "hypertube-2287a.firebaseapp.com",
  databaseURL:
    "https://hypertube-2287a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hypertube-2287a",
  storageBucket: "hypertube-2287a.firebasestorage.app",
  messagingSenderId: "85856277402",
  appId: "1:85856277402:web:9f580905d21756fbb52023",
  measurementId: "G-NXKPNJX895",
};

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get the current file's directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Serve the entire torrent-downloader directory
// app.use("/torrent-downloader/download", express.static(path.join(__dirname, "../torrent-downloader/download")));

app.get("/check-file/:id/:moviename/:filename", (req, res) => {
  const { id, moviename, filename } = req.params;
  const videoPath = path.resolve(
    "/usr/src/app/downloads",
    id,
    moviename,
    filename
  );

  // Check if the file exists
  if (fs.existsSync(videoPath)) {
    return res.status(200).json({ exists: true });
  } else {
    return res.status(404).json({ exists: false });
  }
});


// Route for streaming video files
app.get("/stream/:id/:moviename/:filename", (req, res) => {
  const { id, moviename, filename } = req.params;
  const videoPath = path.resolve(
    "/usr/src/app/downloads",
    id,
    moviename,
    filename
  ); // Construct the full path dynamically
  
  // Check if the file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video not found");
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Parse the Range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.get("/api/movies", async (req, res) => {
  try {
    const fetchAllMovies = `
        SELECT * FROM Movies LIMIT 50;
      `;
    const movieResult = await client.query(fetchAllMovies);
    res.json(movieResult.rows);
  } catch (error) {
    res.status(500).send("Error fetching movies");
  }
});

app.get("/api/movies/:title", async (req, res) => {
  const { title } = req.params;
  if (!title || title.length === 0) {
    try {
      const fetchAllMovies = `
        SELECT * FROM Movies LIMIT 50;
      `;
      const movieResult = await client.query(fetchAllMovies);
      res.json(movieResult.rows);
    } catch (error) {
      res.status(500).send("Error fetching movies");
    }
    return;
  }
  if (title.length < 3) {
    try {
      const searchMoviesInDb = `
      SELECT * FROM Movies WHERE Title ILIKE '%' || $1 || '%';
    `;
      const movieResult = await client.query(searchMoviesInDb, [title]);
      if (movieResult.rows.length > 0) {
        res.json(movieResult.rows);
        return;
      }
      return res.json([]);
    } catch {
      return res.json([]);
    }
  }
  try {
    const searchMoviesInDb = `
    SELECT * FROM Movies WHERE Title ILIKE '%' || $1 || '%';
  `;
    const movieResult = await client.query(searchMoviesInDb, [title]);
    if (movieResult.rows.length > 0) {
      res.json(movieResult.rows);
      return;
    }
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${title}`;
    const response = await axios.get(url);
    if (response.data.Response === "False") {
      return res.status(404).send("Movie not found in OMDB API");
    }
    await client.query("BEGIN");
    for (let element of response.data.Search) {
      const movie = {
        title: element.Title,
        poster: element.Poster !== "N/A" ? element.Poster : null,
        imdbID: element.imdbID,
        year: element.Year,
      };
      const insertQuery = `
      INSERT INTO Movies (Title, Year, Genre, Plot, Director, Poster, imdbID, imdbRating, imdbVotes)
      VALUES ($1, $2, NULL, NULL, NULL, $3, $4, NULL, NULL)
      ON CONFLICT (imdbID) DO UPDATE
      SET 
        Poster = COALESCE(EXCLUDED.Poster, Movies.Poster)
      RETURNING *;
    `;

      await client.query(insertQuery, [
        movie.title,
        movie.year,
        movie.poster,
        movie.imdbID,
      ]);
    }
    await client.query("COMMIT");
    res.json(response.data);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data from OMDB API");
  }
});

app.get("/api/watchTheMovie/:id", async (req, res) => {
  const { id } = req.params;
  const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`;
  if (!id || id.length === 0) {
    return res.status(400).send("Potato");
  }
  try {
    const searchMoviesInDb = `
    SELECT * FROM Movies WHERE LOWER(imdbID) = LOWER($1) LIMIT 1;
    `;
    const movieResult = await client.query(searchMoviesInDb, [id]);
    if (movieResult.rows.length > 0 && movieResult.rows[0].imdbrating) {
      return res.json(movieResult.rows[0]);
    }
    console.log("Fetching from OMDB API");
    const response = await axios.get(url);
    if (response.data.Response === "False") {
      return res.status(404).send("Movie not found in OMDB API");
    }

    const movieData = {
      title: response.data.Title ?? "N/A",
      year: response?.data?.Year ?? "N/A",
      genre: response.data.Genre ?? "N/A",
      plot: response.data.Plot ?? "N/A",
      director: response.data.Director ?? "N/A",
      poster: response.data.Poster === "N/A" ? null : response.data.Poster,
      imdbID: response.data.imdbID ?? "N/A",
      imdbRating: response.data.imdbRating ?? "N/A",
      imdbVotes: response.data.imdbVotes ?? "N/A",
    };
    await client.query("BEGIN");
    const insertQuery = `
    INSERT INTO Movies (Title, Year, Genre, Plot, Director, Poster, imdbID, imdbRating, imdbVotes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (imdbID) DO UPDATE 
    SET 
      Title = EXCLUDED.Title,
      Year = EXCLUDED.Year,
      Genre = EXCLUDED.Genre,
      Plot = EXCLUDED.Plot,
      Director = EXCLUDED.Director,
      Poster = EXCLUDED.Poster,
      imdbRating = EXCLUDED.imdbRating,
      imdbVotes = EXCLUDED.imdbVotes
    RETURNING *;
  `;

    const insertResult = await client.query(insertQuery, [
      movieData.title,
      movieData.year,
      movieData.genre,
      movieData.plot,
      movieData.director,
      movieData.poster,
      movieData.imdbID,
      movieData.imdbRating,
      movieData.imdbVotes,
    ]);
    insertResult.rows;
    await client.query("COMMIT");
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data from OMDB API");
  }
});

app.get("/api/youtubeRequests/:title", async (req, res) => {
  const { title } = req.params;
  if (!title || title.length === 0) {
    return res.status(400).send("Potato");
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${title}&key=${youtubeApiKey}`;
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
      res.status(500).send("Error fetching data from YouTube API");
      return;
    }
    const videos = JSON.stringify(response.data.items);
    await client.query("BEGIN");
    const updateQuery = `
      UPDATE Movies
      SET videos = $1
      WHERE LOWER(Title) = LOWER($2)
      RETURNING *;
    `;
    const updateResult = await client.query(updateQuery, [videos, title]);
    if (updateResult.rows.length === 0) {
    }
    await client.query("COMMIT");
    res.json(response.data.items);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in transaction:", error);
    res
      .status(500)
      .send("Error fetching data from YouTube API or updating the database");
  }
});

app.get("/auth/intra", (req, res) => {
  const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${intraUUID}&redirect_uri=${redirectURI}&response_type=code`;
  res.redirect(authURL);
});

app.post("/auth/intra/callback", async (req, res) => {
  const code = req.body.code;
  const tokenURL = "https://api.intra.42.fr/oauth/token";

  try {
    const response = await axios.post(tokenURL, {
      grant_type: "authorization_code",
      client_id: process.env.INTRA_UUID,
      client_secret: process.env.INTRA_SECRET,
      code,
      redirect_uri: process.env.REDIRECT_URI,
    });

    const accessToken = response.data.access_token;
    res.json({ accessToken });
  } catch (error) {
    console.error("OAuth2 error:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/auth/intra/callback", async (req, res) => {
  const code = req.query.code;
});

async function validateIntra42Token(token) {
  try {
    const response = await axios.get("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function validateFirebaseToken(token) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        idToken: token,
      }
    );
    return response.data.users[0];
  } catch (error) {
    return null;
  }
}

app.get("/auth/validate", async (req, res) => {
  var userData = null;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const searchToken = `SELECT * FROM Users WHERE oauth = $1;`;
    const result = await client.query(searchToken, [token]);
    if (result.rows.length !== 0) {
      userData = result.rows[0];
      return res.status(200).send({ message: "User is valid", user: userData });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.sendStatus(500);
  }
  if (req.headers.authorization.length < 120)
    userData = await validateIntra42Token(token);
  else userData = await validateFirebaseToken(token);
  if (!userData) return res.sendStatus(403);
  if (!(await checkUser(userData.email))) {
    await addUser(userData);
  }
  try {
    const query = `SELECT * FROM Users WHERE email = $1`;
    const result = await client.query(query, [userData.email]);
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    userData = result.rows[0];
    res.status(200).send({ message: "User is valid", user: userData });
  } catch (error) {
    res.status(404).send("Error");
  }
});

app.get("/api/comments", async (req, res) => {
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
      const movieQuery = `SELECT * FROM Movies WHERE movie_id = $1;`;
      const movieResult = await client.query(movieQuery, [comment.movie_id]);
      comment.movieData = movieResult.rows[0];
    }
    res.json(commentsResult.rows);
  } catch (error) {
    res.status(500).send("Error fetching comments");
  }
});

app.get("/api/comments/:movieId", async (req, res) => {
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

app.get("/api/users/:user", async (req, res) => {
  const { user } = req.params;
  if (!user || user.length === 0) {
    return res.status(400).send("Potato");
  }
  try {
    const searchMovie = `SELECT * FROM Users WHERE username = $1;`;
    const movieResult = await client.query(searchMovie, [movieId]);
    if (movieResult.rows.length === 0) {
      return res.status(404).send("User not found");
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

app.post("/api/comments/:movieId", async (req, res) => {
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

client
  .connect()
  .then(async () => {
    console.log("Connected to the database.");
    try {
      await createTables();
    } catch (error) {
      console.error("Error tables:", error);
      process.exit(1);
    }
    app.listen(3000, () => {
      console.log("App running on port 3000.");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.stack);
  });
