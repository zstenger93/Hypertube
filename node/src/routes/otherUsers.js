import express from "express";
import { client } from "../../index.js";
import { justGetUser } from "../utils/validate.js";
const router = express.Router();

async function PatchLanguage(id, body) {
  try {
    if (
      !(
        body.language === "EN" ||
        body.language === "HU" ||
        body.language === "LV"
      )
    )
      return null;
    const query = `UPDATE Users SET language = $1 WHERE user_id = $2 RETURNING language;`;
    const result = await client.query(query, [body.language, id]);
    if (result.rows.length === 0) return null;
    return result.rows[0].language;
  } catch (error) {
    console.error(error);
    return null;
  }
}

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  console.log(body.language);
  if (!token) return res.sendStatus(401);
  try {
    const authUser = await justGetUser(req, res);
    if (authUser === null) return res.status(401).send("Invalid Token");
    if (parseInt(authUser.user_id) !== parseInt(id)) return res.status(403).send("Forbidden");
    if (body.language !== undefined) {
      const language = await PatchLanguage(id, body);
      if (language) return res.json({ language });
      else return res.status(500).send("Something went wrong");
    }
    return res.status(400).send("Probably not allowed action");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || id.length === 0) {
    return res.status(404).send("Potato");
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const authUser = await justGetUser(req, res);
    if (authUser === null) {
      return res.status(401).send("Invalid Token");
    }
    const searchUser = `SELECT * FROM Users WHERE user_id = $1;`;
    const userResults = await client.query(searchUser, [id]);

    if (userResults.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    return res.json(userResults.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

export default router;
