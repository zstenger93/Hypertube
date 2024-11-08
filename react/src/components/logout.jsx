import React, { useState, useEffect } from "react";

function Logout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <nav>
      {isAuthenticated && (
        <button className="hoverTop" onClick={handleLogout}>
          Logout
        </button>
      )}
    </nav>
  );
}

export default Logout;
