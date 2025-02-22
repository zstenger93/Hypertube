import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await fetch("http://localhost:3000/auth/validate", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          // const data = await response.json();
          // localStorage.setItem("accessToken", data.user.oauth);
          setIsValid(true);
        } else {
          setIsValid(false);
          localStorage.removeItem("accessToken");
          navigate("/");
        }
      } catch (error) {
        setIsValid(false);
        localStorage.removeItem("accessToken");
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
