import React, { useEffect, useState } from "react";
import "../App.css";

const Comments = ({ movie }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/${movie}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error.message);
      return [];
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      const data = await getComments();
      setComments(data);
      setLoading(false);
    };

    fetchComments();
  }, [movie]);

  const sendComment = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("accessToken");
    const text = event.target.comment.value;
    const movieId = movie;
    try {
      await fetch(
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
	  const data = await getComments();
	  setComments(data);
    } catch (error) {
      console.log(error.message);
    }
    event.target.comment.value = "";
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="center">
        <form className="center" onSubmit={sendComment}>
          <textarea name="comment"></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
      <div className="center">
        {comments.map((comment, index) => (
          <div className="center" key={comment.id ?? `comment${index}`}>
            <div className="comment">
              {comment.user ? (
                <div className="commentUser">
                  <h3>{comment.user.username}</h3>
                  <img src={comment.user.profile_pic} alt="Profile" />
                </div>
              ) : (
                <div className="commentUser">
                  <h3>Unknown User</h3>
                </div>
              )}
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Comments };