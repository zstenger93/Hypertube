import express from "express";
import { client } from "../../index.js";
const router = express.Router();
import {
  validateFirebaseToken,
  validateIntra42Token,
} from "../utils/validateAuth.js";
import { checkUser, addUser } from "../db/user.js";

router.get("", async (req, res) => {
  var userData = null;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const searchToken = `SELECT * FROM Users WHERE oauth = $1;`;
    const result = await client.query(searchToken, [token]);
    if (result.rows.length !== 0) {
      userData = result.rows[0];
      return res.status(200).send({ message: "User is valid", user: userData });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.sendStatus(500);
  }
  if (req.headers.authorization.length < 120)
    userData = await validateIntra42Token(token);
  else userData = await validateFirebaseToken(token);
  if (!userData) return res.sendStatus(403);
  if (!(await checkUser(userData.email))) {
    await addUser(userData);
  }
  try {
    const query = `SELECT * FROM Users WHERE email = $1`;
    const result = await client.query(query, [userData.email]);
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    userData = result.rows[0];
    res.status(200).send({ message: "User is valid", user: userData });
  } catch (error) {
    res.status(404).send("Error");
  }
});

export default router;
