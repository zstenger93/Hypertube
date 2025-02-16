import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";

const CommentBox = ({ movie }) => {
  const sendComment = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("accessToken");
    const text = event.target.comment.value;
    const movieId = movie;
    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/${movieId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );
      const data = await response.json();
    } catch (error) {
      console.log(error.message);
    }
    event.target.comment.value = "";
  };

  return (
    <div className="center">
      <form className="center" onSubmit={sendComment}>
        <textarea name="comment"></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

const DisplayComments = ({ movie }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getComments = async () => {
    try {
      console.log(movie);
      const response = await fetch(
        `http://localhost:3000/api/comments/${movieId}`
      );
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.log(error.message);
      return [];
    }
  };

  const movieId = movie;

  useEffect(() => {
    const fetchComments = async () => {
      const data = await getComments(movie);
      setComments(data);
      setLoading(false);
    };

    fetchComments();
  }, [movie]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="center">
        {comments.map((comment, index) => (
          <div className="center" key={comment.id ?? `comment${index}`}>
            <h3>{comment.username}</h3>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { DisplayComments, CommentBox };
