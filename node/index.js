import pg from "pg";
import express, { request } from "express";
import cors from "cors";
import axios from "axios";

const jwtSecret = process.env.JWT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const ip = process.env.IP;
const apiKey = process.env.OMDBAPI_KEY;
const youtubeApiKey = process.env.YOUTUBE_KEY;
// const { Client } = pg;

// const client = new Client({
//   user: "postgres",
//   host: "db",
//   database: "postgres",
//   password: "1234",
//   port: 5432,
// });
// //client.connect();
// //createTable();

// const createTable = async () => {
//   await client.query(`CREATE TABLE IF NOT EXISTS users
//     (id serial PRIMARY KEY, name VARCHAR (255) UNIQUE NOT NULL,
//     email VARCHAR (255) UNIQUE NOT NULL, age INT NOT NULL);`);
// };

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
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${title}&key=${youtubeApiKey}`;
  try {
    const response = await axios.get(url);
    res.json(response.data);
    console.log(url);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data from OMDB API");
  }
});


app.get('/login', (req,res) => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = "http://127.0.0.1:3000/users/auth/ft/callback";
  const STATE = "a_random_unique_state_string";
  
  const authorizeUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${STATE}`;
  res.redirect(authorizeUrl);
  console.log(res)
})

app.listen(3000, () => console.log(`App running on port 3000.`));
