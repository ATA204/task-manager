import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loadingUser } = useContext(UserContext);

  let location = useLocation();
  
  if (!loadingUser) {
    if (!user) {
      return <Navigate to={"/login"} />;
    }
    const isAuthorized = allowedRoles.includes(user.role);


    if (!isAuthorized) {
      return <Navigate to={"/403"} />;
    }
    if (isAuthorized) {
      return <Outlet></Outlet>;
    }
  }
};

export default PrivateRoute;
