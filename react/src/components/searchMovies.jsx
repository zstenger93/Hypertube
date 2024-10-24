import React, { useState } from "react";

const SearchComponent = () => {
  const [query, setQuery] = useState("");

  const handleApiRequest = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/movies?title=${value}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleApiRequest}
      />
    </div>
  );
};

export default SearchComponent;
