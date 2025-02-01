import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";

const CommentBox = (movie) => {
  const sendComment = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("accessToken");
    const text = event.target.comment.value;
    const movieId = movie;
    // console.log(token);
    // console.log(event.target.comment.value);
    console.log(movieId);

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

const DisplayComments = () => {

};

export { DisplayComments, CommentBox };
