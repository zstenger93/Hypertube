import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import Logout from "./logout";

const Profile = () => {
  // const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // const response = await fetch("http://localhost:3000/auth/validate", {
        //   method: "GET",
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });
        // if (!response.ok) throw new Error("Failed to fetch user details");
        // const data = await response.json();
        // setUser(data);
      } catch (error) {
      } finally {
        //setLoading(false);
      }
    };
    fetchUserDetails();
  });

  //if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Logout />
    </div>
  );
};

export default Profile;
