import React from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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

function Login() {
  const navigate = useNavigate();

  const handleLoginWithIntra = () => {
    window.location.href = "http://localhost:3000/auth/intra";
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("accessToken", token);
      navigate("/search");
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  if (localStorage.getItem("accessToken")) {
    window.location.href = "/search";
  }

  return (
    <div className="center">
      <button onClick={handleLoginWithIntra}>Login with Intra</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
}

export default Login;
