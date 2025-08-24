import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import Logout from "./logout";
import profile from "../assets/pesant.jpg";
import { getCookie } from "../utils/cookie";
import ChangeDetails from "./changeDetails";
import Library from "./Library";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLan] = useState("EN");

  async function changeLanguage(params) {
    setLan(params || "EN");
    try {
      const response = await fetch(`/users/${user.user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ language: params }),
      });

      if (!response.ok) throw new Error("Some forbiden magic happened or smt;");
    } catch (error) {
      console.log(error);
    }
  }

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
        setLan(data.user.language || "EN");
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
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="LV">LV</option>
          <option value="EN">EN</option>
          <option value="HU">HU</option>
        </select>
        <ChangeDetails name="Username" currentValue={user.username} api="" />
        <ChangeDetails name="Email" currentValue={user.email} api="" />
      </div>
      <div>
        <Library list={user?.watched_movies ?? []} title="Watched Movies" />
        <Library
          list={user?.watch_list ?? []}
          title="Movies to Watch in Future"
        />
        <Library list={user?.liked_movies ?? []} title="Liked Movies" />
      </div>
    </div>
  );
};

export default Profile;
