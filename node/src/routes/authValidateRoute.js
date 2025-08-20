import express from "express";
import { client } from "../../index.js";
const router = express.Router();
import {
  validateFirebaseToken,
  validateIntra42Token,
} from "../utils/validateAuth.js";
import { checkUser, addUser } from "../db/user.js";
import { getUserFromTokenAndAdd } from "../utils/validate.js";

router.get("", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let user = await getUserFromTokenAndAdd(req, res, token);
  if (user) return;
  if (req.headers.authorization.length < 120)
    user = await validateIntra42Token(token);
  else user = await validateFirebaseToken(token);
  if (!user) return res.sendStatus(403);
  if (!(await checkUser(user.email))) {
    await addUser(user);
  }
  try {
    const query = `SELECT * FROM Users WHERE email = $1`;
    const result = await client.query(query, [user.email]);
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    user = result.rows[0];
    res.status(200).send({ message: "User is valid", user: user });
  } catch (error) {
    res.status(404).send("Error");
  }
});

export default router;
