import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3000/auth/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setIsValid(true);
      } else {
        setIsValid(false);
        navigate("/");
      }
    };

    checkToken();
  }, [navigate]);

  if (isValid === null) {
    return <div>Loading...</div>;
  }

  return isValid ? children : null;
};

export default ProtectedRoute;
