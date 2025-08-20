import { client } from "../../index.js";

export async function getUserFromToken(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.sendStatus(401);
    return null;
  }
  try {
    const query = `SELECT * FROM Users WHERE oauth = $1;`;
    const result = await client.query(query, [token]);
    if (result.rows.length === 0) {
      res.sendStatus(403);
      return null;
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching user:", error);
    res.sendStatus(500);
    return null;
  }
}

export async function getUserFromTokenAndAdd(req, res, token) {
  var user = null;
  if (!token) return null, null;
  try {
    const searchToken = `SELECT * FROM Users WHERE oauth = $1;`;
    const result = await client.query(searchToken, [token]);
    if (result.rows.length !== 0) {
      user = result.rows[0];
      res.status(200).send({ message: "User is valid", user: user });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.sendStatus(500);
  }
  return user;
}

export async function justGetUser(req, resp) {
  var user = null;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);
    if (result.rows.length !== 0) {
      user = result.rows[0];
    }
    return user;
  } catch (error) {
    return null;
  }
}
