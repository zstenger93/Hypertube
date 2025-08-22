import express from "express";
import { client } from "../../index.js";
import { justGetUser } from "../utils/validate.js";
const router = express.Router();

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
    const searchUser = `SELECT * FROM Users WHERE username = $1;`;
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
