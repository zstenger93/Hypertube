import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";
import Logout from "./logout";
import profile from "../assets/pesant.jpg";
import { getCookie } from "../utils/cookie";

const OtherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/users/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        });
        if (!response.ok) {
          navigate("/404");
          return;
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [name, navigate]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;
  const profilePic = user.profile_pic ?? profile;
  return (
    <div className="center">
      <Logout />
      <div className="profileContainer">
        <h1>Profile</h1>
        <div className="profile">
          <img src={profilePic} alt="profile" />
          <img src={"/src/assets/jail.png"} alt="overlay" className="overlay" />
        </div>
        <h3>{user.username}</h3>
        <Library user={user} mode="0" />
      </div>
    </div>
  );
};

export default OtherProfile;
