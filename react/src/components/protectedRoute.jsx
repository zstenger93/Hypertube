import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCookie, getCookie, setCookie } from "../utils/cookie";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = getCookie("accessToken");
      try {
        const response = await fetch(`/auth/validate`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCookie("accessToken", data.user.oauth);
          setIsValid(true);
        } else {
          setIsValid(false);
          deleteCookie("accessToken");
          navigate("/");
        }
      } catch (error) {
        setIsValid(false);
        deleteCookie("accessToken");
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
