import pg from "pg";
import express, { request } from "express";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";
import { createTables } from "./src/db/createTables.js";
import { checkUser, addUser } from "./src/db/user.js";
import moviesRoute from "./src/routes/movieRoute.js";
import movieTitleRoute from "./src/routes/movieTitleRoute.js";
import watchTheMovieRoute from "./src/routes/watchTheMovieId.js";
import youtubeMovieRoute from "./src/routes/youtubeRequestsRoute.js";
import authIntraRoute from "./src/routes/authIntraRoute.js";
import apiAuthIntraCallbackRoute from "./src/routes/apiAuthIntraCallbackRoute.js";
import authValidateRoute from "./src/routes/authValidateRoute.js";
import allCommentsRoute from "./src/routes/allCommentsRoute.js";
import commentsMovieIdRoute from "./src/routes/commentMovieIdRoute.js";
import likeRoute from "./src/routes/like.js";
import watchRoute from "./src/routes/watch.js";
import watchedRoute from "./src/routes/watched.js";
import otherUsersRoute from "./src/routes/otherUsers.js";
import clickRoute from "./src/routes/click.js";
import addComment from "./src/routes/addComment.js";
import getStateRoute from "./src/routes/getState.js";
import path from "path";
import fs from "fs";

const { Client } = pg;

export const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/movies", moviesRoute);
app.use("/movies", movieTitleRoute);
app.use("/watchTheMovie", watchTheMovieRoute);
app.use("/youtubeRequests", youtubeMovieRoute);
app.use("/auth/intra", authIntraRoute);
app.use("/api/auth/intra/callback", apiAuthIntraCallbackRoute);
app.use("/auth/validate", authValidateRoute);
app.use("/comments", allCommentsRoute);
app.use("/comments", commentsMovieIdRoute);
app.use("/like", likeRoute);
app.use("/watch", watchRoute);
app.use("/watched", watchedRoute);
app.use("/click", clickRoute);
app.use("/comments", addComment);
app.use("/state", getStateRoute);
app.use("/users", otherUsersRoute);

app.get("/check-file/:id/:moviename/:filename", async (req, res) => {
  const { id, moviename, filename } = req.params;
  const videoPath = path.resolve(
    "/usr/src/app/downloads",
    id,
    moviename,
    filename
  );

  try {
    await fs.promises.access(videoPath);
    return res.status(200).json({ exists: true });
  } catch (error) {
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
    app.listen(3000, "0.0.0.0", () => {
      console.log("App running on port 3000.");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.stack);
  });