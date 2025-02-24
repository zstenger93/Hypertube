// components/callback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CallbackComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get("code");

        if (code) {
          const response = await axios.post(
            "http://localhost:3000/auth/intra/callback",
            { code }
          );
          const token = response.data.accessToken;
          if (token) {
            localStorage.setItem("accessToken", token);
            navigate("/search");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    };

    fetchToken();
  }, [navigate]);

  return <p>Authenticating...</p>;
}

export default CallbackComponent;
