import React from "react";

function Login() {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/intra";
  };

  if (localStorage.getItem("accessToken")) {
    window.location.href = "/search";
  }

  return <button onClick={handleLogin}>Login with Intra</button>;
}

export default Login;
