import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserAuth } from "../hooks/useUserAuth";
import { UserContext } from "../context/UserContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext);

  // console.log("User:", user);
  // console.log("Allowed role:", allowedRoles);
  // console.log(allowedRoles);
  let location = useLocation();
  // console.log(location);
  if (!loading) {
    if (!user) {
      return <Navigate to={"/login"} />;
    }
    const isAuthorized = allowedRoles.includes(user.role);
    // console.log(isAuthorized);

    if (!isAuthorized) {
      return <Navigate to={"/403"} />;
    }
    if (isAuthorized) {
      return <Outlet></Outlet>;
    }
  }
};

export default PrivateRoute;
