import express from "express";
const router = express.Router();

router.get("", async (req, res) => {
  const code = req.query.code;
});

export default router