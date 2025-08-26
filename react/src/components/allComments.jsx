import Logout from "./logout";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import poster from "../assets/poster.jpg";

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
      return [];
    }
  };

  const onErrorImage = (e) => {
    if (
      !e.target.complete ||
      e.target.naturalHeight < 50 ||
      e.target.naturalWidth < 50
    ) {
      e.target.src = poster;
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
    <div style={{ position: 'relative', minHeight: '100vh' }}>
    <div className="center">
      <Logout />
      <h1>All Comments</h1>
      {comments.map((comment) => (
        <div className="allComment" key={comment.comment_id}>
          <button
            className="commentButton"
            onClick={() => navigate(`/movie/${comment.movieData.imdbid}`)}
          >
            <img
              src={comment.movieData.poster || "/src/assets/poster.jpg"}
              onError={onErrorImage}
            />
          </button>
          <div className="centerComment" style={{marginBottom: '40px'}}>
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
    <footer style={{
        position: 'absolute',
        bottom: '-50px',
        width: '100%',
        color: 'white',
        textAlign: 'center',
        padding: '10px 0',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <p style={{ color: '#aaff00', margin: '5px 0', fontSize: '14px' }}>
            © 2025 HyperCrime - For Educational Purposes Only
          </p>
          <p style={{ 
            color: '#aaff00', margin: '8px 0 0 0', 
            fontSize: '12px', 
            opacity: 0.7 
          }}>
            This project is a demonstration and not intended for actual use.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AllComments;
