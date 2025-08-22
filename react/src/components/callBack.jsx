// components/callback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCookie, setCookie } from "../utils/cookie";
import salt from "../assets/salt.jpg";

function CallbackComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const response = await axios.post(`/api/auth/intra/callback`, {
            code,
          });
          const token = response.data.accessToken;
          if (token) {
            setCookie("accessToken", token);
            const response = await fetch(`/auth/validate`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${getCookie("accessToken")}`,
              },
            });
            if (!response.ok) throw new Error("Failed to fetch user details");
            const data = await response.json();
            setCookie("accessToken", data.user.oauth);
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

  return <img className="centerMemes" src={salt}></img>;
}

export default CallbackComponent;
