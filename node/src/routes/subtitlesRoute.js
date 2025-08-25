import express from "express";

const router = express.Router();

router.get("/subtitles/:imdbId", async (req, res) => {
  const { imdbId } = req.params;

  // Check if the API key is defined
  if (!process.env.OPENSUBTITLE_API_KEY) {
    console.error("OpenSubtitles API key is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const response = await fetch(`https://api.opensubtitles.com/api/v1/subtitles?imdb_id=${imdbId}`, {
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.OPENSUBTITLE_API_KEY,
        "User-Agent": "Hypertube v1.0",
      },
    });

    if (!response.ok) {
      console.error(`OpenSubtitles API error: ${response.statusText}`);
      return res.status(response.status || 500).json({ error: "Failed to fetch subtitles" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching subtitles:", error.message || error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;