import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/subtitles/:imdbId", async (req, res) => {
  const { imdbId } = req.params;

  try {
    const response = await fetch(`https://api.opensubtitles.com/api/v1/subtitles?imdb_id=${imdbId}`, {
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.OPENSUBTITLE_API_KEY, // Access the API key from environment variables
        "User-Agent": "Hypertube v1.0", // Replace with your app's name and version
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch subtitles" });
    }

    const data = await response.json();
    res.json(data); // Send the subtitles data back to the frontend
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;