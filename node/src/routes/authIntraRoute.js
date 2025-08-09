import express from "express";
import { client } from "../../index.js";
import axios from "axios";
const router = express.Router();
const intraUUID = process.env.INTRA_UUID;
const redirectURI = process.env.REDIRECT_URI;

router.get("/", (req, res) => {
  const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${intraUUID}&redirect_uri=${redirectURI}&response_type=code`;
  res.redirect(authURL);
});

export default router;
