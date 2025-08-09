import express from "express";
import { client } from "../../index.js";
const router = express.Router();

router.get("/:user", async (req, res) => {
  const { user } = req.params;
  if (!user || user.length === 0) {
    return res.status(400).send("Potato");
  }
  try {
    const searchUser = `SELECT * FROM Users WHERE username = $1;`;
    const userResults = await client.query(searchUser, [user]);
    if (userResults.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    res.json(commentsResult.rows);
  } catch (error) {
    res.status(500).send("Error");
  }
});

export default router