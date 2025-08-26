import React, { useEffect, useState } from "react";
import "../App.css";
import { getCookie } from "../utils/cookie";

const Comments = ({ movie, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getComments = async () => {
    try {
      const response = await fetch(`/comments/${movie}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  };

  async function deleteComment(comment_id) {
    try {
      const response = await fetch(`/comments/${comment_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      if (!response.ok) throw new Error("Some error");
      setComments((prev) => prev.filter((c) => c.comment_id !== comment_id));
    } catch (error) {}
  }

  async function patchComment(comment_id) {
    try {
      const response = await fetch(`/comments/${comment_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ text: "Wow I tried to hide my opinions!" }),
      });
      if (!response.ok) throw new Error("Some error");
      const data = await response.json();
      setComments((prev) =>
        prev.map((comma) =>
          comma.comment_id === comment_id ? data.comment : comma
        )
      );
    } catch (error) {}
  }

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
    const text = event.target.comment.value;
    const movieId = movie;
    try {
      await fetch(`/comments/${movieId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await getComments();
      setComments(data);
    } catch (error) {}
    event.target.comment.value = "";
  };

  if (loading) return <p>Loading...</p>;
  if (!currentUser) return <p>Loading user...</p>;

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
                  {String(currentUser.user_id) ===
                    String(comment.user.user_id) && (
                    <>
                      <button
                        style={{
                          width: "50%",
                          height: "15%",
                          border: "2px",
                          fontSize: "7px",
                        }}
                        onClick={() => deleteComment(comment.comment_id)}
                      >
                        Delete
                      </button>
                      <button
                        style={{
                          width: "50%",
                          height: "15%",
                          border: "2px",
                          fontSize: "7px",
                        }}
                        onClick={() => patchComment(comment.comment_id)}
                      >
                        Edit
                      </button>
                    </>
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
