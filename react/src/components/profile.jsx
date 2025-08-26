import React, { useEffect, useState } from "react";
import "../App.css";
import Logout from "./logout";
import profile from "/pesant.jpg";
import { getCookie } from "../utils/cookie";
import Library from "./Library";
import { getAuth } from "firebase/auth";
import { deleteCookie } from "../utils/cookie";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLan] = useState("EN");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function changeEmail(newEmail) {
    try {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error("No user logged in.");
      }
      const newToken = await firebaseUser.getIdToken();
      const token = getCookie("accessToken");
      const response = await fetch(`/users/${user.user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail, newToken }),
      });
      if (!response.ok) throw new Error("Smt went wrong");
      deleteCookie("accessToken");
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  }

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
        setUsername(data.user.username);
        setEmail(data.user.email);
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
        <p>{error}</p>
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="LV">LV</option>
          <option value="EN">EN</option>
          <option value="HU">HU</option>
        </select>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 0,
            margin: 0,
          }}
        >
          <label>Username</label>
          <input
            placeholder=""
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button>Change username</button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 0,
            margin: 0,
          }}
        >
          <label>Email</label>
          <input
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={() => changeEmail(email)}>Change email</button>
        </div>
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
