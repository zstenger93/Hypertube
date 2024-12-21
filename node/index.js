import pg from "pg";
import express, { request } from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import TorrentSearchApi from 'torrent-search-api';
import { exec } from 'child_process';
import path from 'path';

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

async function createTables() {
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
          user_id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          profile_pic VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created Users");
    await client.query("COMMIT");

    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS Movies (
          movie_id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          release_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created Movies");
    await client.query("COMMIT");

    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS Comments (
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
    console.error("Error checking user:", error);
    return false;
  }
}

async function addUser(userData) {
  try {
    const query = `
      INSERT INTO Users (username, email) 
      VALUES ($1, $2)
      RETURNING *;
    `;
    fs.writeFile("userData.json", JSON.stringify(userData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file", err);
      } else {
        console.log("userData written to file");
      }
    });
    const values = [userData.displayname, userData.email];
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
}

client
  .connect()
  .then(() => {
    console.log("Connected to the database.");
    return createTables();
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.stack);
  });

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

app.get("/api/movies", async (req, res) => {
  const { title } = req.query;
  const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${title}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data from OMDB API");
  }
});

app.get("/api/watchTheMovie", async (req, res) => {
  const { id } = req.query;
  const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data from OMDB API");
  }
});

app.get("/api/youtubeRequests", async (req, res) => {
  const { title } = req.query;
  const movie = "%movie";
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${title}&key=${youtubeApiKey}`;
  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data from OMDB API");
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
  console.log("Received code:", code);
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
  if (req.headers.authorization.length < 120)
    userData = await validateIntra42Token(token);
  else userData = await validateFirebaseToken(token);
  if (!userData) return res.sendStatus(403);
  req.user = userData;
  if (!(await checkUser(userData.email))) await addUser(userData);
  res.status(200).send({ message: "User is valid", user: userData });
});

TorrentSearchApi.enableProvider('ThePirateBay');

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  const torrents = await TorrentSearchApi.search(query, 'Movies', 20);
  res.json(torrents);
});

app.get('/api/download', (req, res) => {
  const { magnetURI } = req.query;
  const downloadPath = path.join(__dirname, 'downloads');

  exec(`aria2c --seed-time=0 -d ${downloadPath} "${magnetURI}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send('Error downloading torrent');
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.send('Download started');
  });
});


app.get('/api/stream', (req, res) => {
  const videoPath = path.join(__dirname, 'downloads', 'video-file.mp4');
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.listen(3000, () => console.log(`App running on port 3000.`));
