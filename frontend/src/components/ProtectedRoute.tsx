import React, { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext"; // Correct path to RoleContext

interface ProtectedRouteProps {
  children: ReactNode; // Define the type for the children prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { role, setRole } = useRole();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch(
          "https://intexrahhh-backend-fzfrcxdnc2b5g9f7.eastus-01.azurewebsites.net/api/User/role",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRole(data.roles[0]);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [setRole]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (role !== "Administrator") {
    navigate("/browse");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
