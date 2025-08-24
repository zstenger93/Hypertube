import Logout from "./logout";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AllComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAllComments = async () => {
    try {
      const response = await fetch(`/comments/`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error.message);
      return [];
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      const data = await getAllComments();
      setComments(data);
      setLoading(false);
    };

    fetchComments();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="center">
      <Logout />
      <h1>All Comments</h1>
      {comments.map((comment) => (
        <div className="allComment" key={comment.comment_id}>
          <button
            className="commentButton"
            onClick={() => navigate(`/movie/${comment.movieData.imdbid}`)}
          >
            <img src={comment.movieData.poster || "/src/assets/poster.jpg"} />
          </button>
          <div className="centerComment">
            <h3>
              {comment.movieData.title} ({comment.movieData.year})
            </h3>
            <h3>{comment.user.username}</h3>
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
      ))}
    </div>
  );
};

export default AllComments;
