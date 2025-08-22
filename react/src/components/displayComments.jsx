import React, { useEffect, useState } from "react";
import "../App.css";
import { getCookie } from "../utils/cookie";

const Comments = ({ movie, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(currentUser);
  const getComments = async () => {
    try {
      const response = await fetch(`/comments/${movie}`);
      const data = await response.json();
      return data;
    } catch (error) {
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
    const token = getCookie("accessToken");
    const text = event.target.comment.value;
    const movieId = movie;
    try {
      await fetch(`/comments/${movieId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
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
                  {currentUser && comment.id === currentUser.user_id && (
                    <button>Edit</button>
                  )}
                  {currentUser && comment.id === currentUser.user_id && (
                    <button>Delete</button>
                  )}
                </div>
              ) : (
                <div className="commentUser">
                  <h3>Unknown User</h3>
                </div>
              )}
              <div className="centerComment">
                <p>
                  {comment.content.match(/.{1,60}/g)?.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Comments };
