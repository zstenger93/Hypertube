import React from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCookie, setCookie, deleteCookie } from "../utils/cookie";

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

const WarningPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowPopup(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  return (
    showPopup && (
      <div>
        <div className="popup">
          <h1>WARNING!!!!</h1>
          <p>THIS PROJECT IS MADE FOR EDUCATIONAL PURPOSES</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      </div>
    )
  );
};

function Login() {
  const [showInputs, setShowInputs] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleLoginWithIntra = () => {
    window.location.href = `/auth/intra`;
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      setCookie("accessToken", token);
    } catch (error) {
      setInfo(error.message);
    }
    try {
      const response = await fetch(`/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      if (!response.ok) {
        deleteCookie("accessToken");
        return;
      }
      const data = await response.json();
      setCookie("accessToken", data.user.oauth);
      navigate("/search");
    } catch {
      setInfo(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (email === "") return;
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setInfo(error.message);
    }
  };

  const handleSubmit = async () => {
    const auth = getAuth();
    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setInfo("Sent User Verification");
      }
      const token = await userCredential.user.getIdToken();
      setCookie("accessToken", token);
      const response = await fetch(`/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      if (!response.ok) {
        deleteCookie("accessToken");
        return;
      }
      const data = await response.json();
      setCookie("accessToken", data.user.oauth);
      navigate("/search");
    } catch (error) {
      setInfo(error.message);
    }
  };

  const handleShowHideInputs = () => {
    setShowInputs(!showInputs);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="centerScreen">
      <WarningPopup />
      <div
        style={{
          backgroundImage: "url('/Pirate-Flag.svg')",
          backgroundSize: "calc(100% - 40px) calc(100% - 40px)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          zIndex: 0,
        }}
      ></div>
      {!showInputs && (
        <>
          <button onClick={() => navigate("/search")}>Search</button>
          <button onClick={() => navigate("/x")}>Comments</button>
          <button onClick={handleLoginWithIntra}>Login with Intra</button>
          <button onClick={handleGoogleLogin}>Login with Google</button>
        </>
      )}

      <button onClick={handleShowHideInputs}>
        {showInputs
          ? isRegistering
            ? "Hide Register"
            : "Other Login Options"
          : isRegistering
          ? "Register with Email"
          : "Login with Email"}
      </button>
      {showInputs && (
        <div className="center">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSubmit}>
            {isRegistering ? "Register with Email" : "Login with Email"}
          </button>
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>
          <button onClick={handleForgotPassword}>{"Forgot password?"}</button>
          <p>{info}</p>
        </div>
      )}
    </div>
  );
}

export default Login;
