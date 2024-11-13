import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";

const MovieComments = () => {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/watchTheMovie?id=${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch comments");

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="center">
      {movie ? (
        <div>
          <div className="commentList">
            {videos.map((comments) => (
              <div key={comments.id.videoId} className="videoItem">
                <a
                  href={`https://www.youtube.com/watch?v=${comments.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={comments.snippet.thumbnails.medium.url}
                    alt={comments.snippet.title}
                  />
                  <p>{comments.snippet.title}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Comments not found.</p>
      )}
    </div>
  );
};

export default MovieComments;
