import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";

const CommentBox = (movie) => {
  const sendComment = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("accessToken");
    console.log(token);
    console.log(event.target.comment.value);
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

const DisplayComments = () => {};

export { DisplayComments, CommentBox };
