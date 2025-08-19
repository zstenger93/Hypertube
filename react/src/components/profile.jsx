import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import Logout from "./logout";
import profile from "../assets/pesant.jpg";
import { getCookie } from "../utils/cookie";
import ChangeDetails from "./changeDetails";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/auth/validate`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch user details");
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (user.profile_pic === null) user.profile_pic = profile;

  return (
    <div className="center">
      <Logout />
      <div className="profileContainer">
        <h1>Profile</h1>
        <div className="profile">
          <img src={user.profile_pic} alt="profile" />
          <img src={"/src/assets/jail.png"} alt="overlay" className="overlay" />
        </div>
        <ChangeDetails name="Username" currentValue={user.username} api="" />
        <ChangeDetails name="Email" currentValue={user.email} api="" />
      </div>
    </div>
  );
};

export default Profile;
