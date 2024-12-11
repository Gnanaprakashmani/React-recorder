import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "./utils";

function ProtectedRoute({ children }) {
  const authToken = getToken();
  const token = authToken;
  return token ? children : <Navigate to="/" />;
}

export default ProtectedRoute;
