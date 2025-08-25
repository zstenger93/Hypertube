import { client } from "../../index.js";
import crypto from "crypto";

export async function checkUser(email) {
  try {
    const query = `SELECT * FROM Users WHERE email = $1`;
    const result = await client.query(query, [email]);
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

export async function addUser(userData) {
  try {
    // var provider = null;
    // if (userData.provider === "intra") provider = "intra";
    // else if (userData.provider === "google") provider = "google";
    // else if (userData.provider === "firebase") provider = "firebase";
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
