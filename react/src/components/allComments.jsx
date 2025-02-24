import Logout from "./logout";
import React, { useEffect, useState } from "react";

const AllComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllComments = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/comments`);
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
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div className="center">
      <Logout />
      <h1>All Comments</h1>
      {comments.map((comment) => (
        <div className="comment"></div>
      ))}
    </div>
  );
};

export default AllComments;
