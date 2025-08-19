// components/callback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCookie, setCookie } from "../utils/cookie";

function CallbackComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const response = await axios.post(
            `http://${import.meta.env.VITE_IP}/api/auth/intra/callback`,
            { code }
          );
          const token = response.data.accessToken;
          if (token) {
            setCookie("accessToken", token);
            const response = await fetch(
              `http://${import.meta.env.VITE_IP}/auth/validate`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${getCookie("accessToken")}`,
                },
              }
            );
            if (!response.ok) throw new Error("Failed to fetch user details");
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
