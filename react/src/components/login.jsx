import React from "react";

function Login() {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/intra";
  };

  return <button onClick={handleLogin}>Login with Intra</button>;
}

export default Login;
