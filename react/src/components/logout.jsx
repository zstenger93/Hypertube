import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { deleteCookie, getCookie } from "../utils/cookie";

const firebaseConfig = {
  apiKey: "AIzaSyDdCQbBKuVCKAR67luHVd_WyxpEGVvRfNI",
  authDomain: "hypertube-2287a.firebaseapp.com",
  databaseURL:
    "https://hypertube-2287a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hypertube-2287a",
  storageBucket: "hypertube-2287a.firebasestorage.app",
  messagingSenderId: "85856277402",
  appId: "1:85856277402:web:9f580905d21756fbb52023",
  measurementId: "G-NXKPNJX895",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function Logout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const token = getCookie("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {}
    deleteCookie("accessToken");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <nav>
      <div className="hoverTop">
        <button onClick={() => navigate("/search")}>Search</button>
        <button onClick={() => navigate("/comments")}>Comments</button>
        {isAuthenticated && (
          <button onClick={() => navigate("/profile")}>Profile</button>
        )}
        {isAuthenticated && <button onClick={handleLogout}>Logout</button>}
        {!isAuthenticated && (
          <button onClick={() => navigate("/")}>Log In</button>
        )}
      </div>
    </nav>
  );
}

export default Logout;
