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
  const [surename, setSurename] = useState("");
  const [name, setName] = useState("");
  const [hide, setHide] = useState(true);
  const navigate = useNavigate();

  async function changeName(name) {
    try {
      if (!name || name.length < 1 || name.length > 20)
        throw new Error("Nickname  1 < nick < 20 characters.");
      const response = await fetch(`/users/${user.user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ name: name }),
      });
      if (!response.ok) throw new Error("Fail");
      const updatedUser = await response.json();
      setName(updatedUser.name || name);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

  async function changeSurename(surename) {
    try {
      if (!surename || surename.length < 1 || surename.length > 20)
        throw new Error("Nickname  1 < nick < 20 characters.");
      const response = await fetch(`/users/${user.user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ surename: surename }),
      });
      if (!response.ok) throw new Error("Fail");
      const updatedUser = await response.json();
      setSurename(updatedUser.surename || surename);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

  async function changeNicname(nick) {
    try {
      if (!nick || nick.length < 1 || nick.length > 20)
        throw new Error("Nickname  1 < nick < 20 characters.");
      const response = await fetch(`/users/${user.user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ nicname: nick }),
      });
      if (!response.ok) throw new Error("Fail");
      const updatedUser = await response.json();
      setUsername(updatedUser.nicname || nick);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

  async function changeProfilePicture(pic) {
    try {
      const response = await fetch(`/users/${user.user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: JSON.stringify({ pic: pic }),
      });
      if (!response.ok) throw new Error("Fail");
      window.location.reload();
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

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
    } catch (error) {}
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
        setSurename(data.user.surename);
        setName(data.user.name);
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
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="center">
        <Logout />
        <div className="profileContainer">
          <h1>Profile</h1>
          <div className="profile">
            <img src={user.profile_pic} alt="profile" />
            <img
              src={"/src/assets/jail.png"}
              alt="overlay"
              className="overlay"
            />
          </div>
          <button onClick={() => setHide(!hide)}>
            {hide ? "Show Info" : "Hide Info"}
          </button>
          <p>{error}</p>
          {!hide && (
            <>
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="LV">LV</option>
                <option value="EN">EN</option>
                <option value="ES">ES</option>
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
                <button onClick={() => changeNicname(username)}>
                  Change username
                </button>
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
                <label>name</label>
                <input
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button onClick={() => changeName(name)}>Change Name</button>
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
                <label>Surename</label>
                <input
                  placeholder=""
                  value={surename}
                  onChange={(e) => setSurename(e.target.value)}
                />
                <button onClick={() => changeSurename(surename)}>
                  Change surename
                </button>
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
                <button onClick={() => changeProfilePicture("pesant")}>
                  Default profile picture
                </button>

                <button onClick={() => changeProfilePicture("change")}>
                  Awesome meme picture
                </button>
              </div>
            </>
          )}
        </div>
        <div style={{ marginBottom: "42px" }}>
          <Library list={user?.watched_movies ?? []} title="Watched Movies" />
          <Library
            list={user?.watch_list ?? []}
            title="Movies to Watch in Future"
          />
          <Library list={user?.liked_movies ?? []} title="Liked Movies" />
        </div>
      </div>
      <footer
        style={{
          position: "absolute",
          bottom: "-30px",
          width: "100%",
          color: "white",
          textAlign: "center",
          padding: "10px 0",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
          <p style={{ color: "#aaff00", margin: "5px 0", fontSize: "14px" }}>
            © 2025 HyperCrime - For Educational Purposes Only
          </p>
          <p
            style={{
              color: "#aaff00",
              margin: "8px 0 0 0",
              fontSize: "12px",
              opacity: 0.7,
            }}
          >
            This project is a demonstration and not intended for actual use.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
