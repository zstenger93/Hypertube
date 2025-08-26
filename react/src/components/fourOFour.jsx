import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nooooo from "../assets/404.jpg";

const FourOFour = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return <img src={Nooooo} className="centerMemes" />;
};

export default FourOFour;
