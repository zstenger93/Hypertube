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
import { useState } from "react";

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
  const [showInputs, setShowInputs] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, resetPasswprd] = useState(false);
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
    } catch (error) {}
  };

  const handleForgotPassword = async () => {
    if (email === "") return;
    console.log("here");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending reset email:", error);
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
      }
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("accessToken", token);
      navigate("/search");
    } catch (error) {
      console.error("Authentication Error:", error);
    }
  };

  const handleShowHideInputs = () => {
    setShowInputs(!showInputs);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="centerScreen" >
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
      <button onClick={handleLoginWithIntra}>Login with Intra</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleShowHideInputs}>
        {showInputs
          ? isRegistering
            ? "Hide Register"
            : "Hide Login"
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
        </div>
      )}
    </div>
  );
}

export default Login;
