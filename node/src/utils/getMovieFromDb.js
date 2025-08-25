import { client } from "../../index.js";

export async function getMovieFromDB(id) {
  const searchMoviesInDb = `
    SELECT * FROM Movies WHERE LOWER(imdbID) = LOWER($1) LIMIT 1;
  `;
  const movieResult = await client.query(searchMoviesInDb, [id]);
  if (movieResult.rows.length > 0 && movieResult.rows[0].imdbrating) {
    return movieResult.rows[0];
  }
  return null;
}
