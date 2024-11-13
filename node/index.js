import pg from "pg";
import express, { request } from "express";
import cors from "cors";
import axios from "axios";

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


async function createUser() {

}

async function createComment(){

}

async function updateCommentContent(email, newComment) {
  try {
    const result = await client.query(`
      SELECT * FROM Comments
      WHERE user_id = $1;
    `, [email]);

    if (result.rows.length === 0) {
      console.log(`No comments found for user_id: ${userId}`);
      return;
    }
    await client.query(`
      UPDATE Comments
      SET content = $1
      WHERE user_id = $2;
    `, [newComment, email]);

    console.log(`Updated comments for user_id: ${userId}`);
  } catch (error) {
    console.error("Error updating comment content:", error);
  }
}

class User {

}


async function createUser(email, newComment) {
  try {
    const result = await client.query(`
      SELECT * FROM Comments
      WHERE user_id = $1;
    `, [email]);

    if (result.rows.length === 0) {
      console.log(`No comments found for user_id: ${userId}`);
      return;
    }
    await client.query(`
      UPDATE Comments
      SET content = $1
      WHERE user_id = $2;
    `, [newComment, email]);

    console.log(`Updated comments for user_id: ${userId}`);
  } catch (error) {
    console.error("Error updating comment content:", error);
  }
}

async function updateRating() {

}

async function createTable() {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
          user_id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          language VARCHAR(100)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Movies (
          movie_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          release_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          rating VARCHAR(255),
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Comments (
          comment_id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES Users(email) ON DELETE CASCADE,
          movie_id VARCHAR(255) REFERENCES Movies(movie_id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await client.end();
  }
}

createTable();

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
  console.log(userData.email);
  req.user = userData;
  res.status(200).send({ message: "User is valid", user: userData });
});

app.listen(3000, () => console.log(`App running on port 3000.`));


// DATABASE INTERACTIONS

app.get("/database/addUser", async (req, res) => {
  var userData = null;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  if (req.headers.authorization.length < 120)
    userData = await validateIntra42Token(token);
  else userData = await validateFirebaseToken(token);
  if (!userData) return res.sendStatus(403);
  console.log(userData.email);
  req.user = userData;
  req.user.email
});

app.post("/database/updateComment", async (req, res) => {
  const code = req.query.code;
  console.log("Received code:", code);
});