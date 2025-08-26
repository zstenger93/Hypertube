import { client } from "../../index.js";
import { dropTables } from "../db/dropTables.js";

export async function createTables() {
  try {
    // await dropTables();
    await client.query(
      `ALTER DATABASE ${process.env.DB_NAME} REFRESH COLLATION VERSION`
    );
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.Users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        surename VARCHAR(100) NOT NULL,
        watched_movies VARCHAR(50)[],
        clicked_movies VARCHAR(50)[],
        watch_list VARCHAR(50)[],
        liked_movies VARCHAR(50)[],
        email VARCHAR(100) UNIQUE NOT NULL,
        profile_pic VARCHAR(255),
        oauth VARCHAR(255) UNIQUE,
        sign_in_provider VARCHAR(255),
        language VARCHAR(255),
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
