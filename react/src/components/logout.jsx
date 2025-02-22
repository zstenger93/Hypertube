import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";

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

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await this.signOutUser();
    } catch (error) {
    }
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <nav>
      {isAuthenticated && (
        <button className="hoverTop" onClick={handleLogout}>
          Logout
        </button>
      )}
    </nav>
  );
}

export default Logout;
