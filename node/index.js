import pg from "pg";
import express, { request } from "express";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";
import { createTables } from "./src/db/createTables.js";
import movieTitleRoute from "./src/routes/movies.js";
import authIntraRoute from "./src/routes/authIntra.js";
import apiAuthIntraCallbackRoute from "./src/routes/apIntra.js";
import authValidateRoute from "./src/routes/authValidateRoute.js";
import allCommentsRoute from "./src/routes/allCommentsRoute.js";

import comments from "./src/routes/comments.js";
import otherUsersRoute from "./src/routes/users.js";
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

app.use("/auth/intra", authIntraRoute);
app.use("/api/auth/intra/callback", apiAuthIntraCallbackRoute);
app.use("/auth/validate", authValidateRoute);
app.use("/movies", movieTitleRoute);
app.use("/comments", comments);
app.use("/comments", allCommentsRoute);
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
