import pg from "pg";
import express from "express";
import cors from "cors";

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
  console.log(title);
  res.json({ title });
});

app.listen(3000, () => console.log(`App running on port 3000.`));
