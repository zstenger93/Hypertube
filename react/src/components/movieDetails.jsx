import React, { useState } from "react";
import "../App.css";

const MovieDetails = () => {
  //   const [query, setQuery] = useState("");
  //   const [results, setResults] = useState([]);

  //   const handleApiRequest = async (e) => {
  //     const value = e.target.value;
  //     setQuery(value);
  //     if (value) {
  //       try {
  //         const response = await fetch(
  //           `http://localhost:3000/api/movies?title=${value}`
  //         );
  //         const data = await response.json();
  //         setResults(data.Search || []);
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     } else {
  //       setResults([]);
  //     }
  //   };

  return (
    <div className="center">
      <h1>HyperTube</h1>
    </div>
  );
};

export default MovieDetails;
