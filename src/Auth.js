import React, { useState } from "react";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "./constant/routeConstant";
import { storeToken } from "./utils";

const cognitoClient = new CognitoIdentityProviderClient({
  region: "eu-north-1",
});

const initialValues = {
  username: "",
  password: "",
  phoneNumber: "",
  name: "",
};
function AuthUI() {
  const [mode, setMode] = useState("signIn");
  const [form, setForm] = useState(initialValues);
  const [message, setMessage] = useState("");
  const Navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const params = {
        ClientId: process.env.REACT_APP_AWS_CLIENT_ID,
        Username: form.username,
        Password: form.password,
        UserAttributes: [
          { Name: "phone_number", Value: form.phoneNumber },
          { Name: "name", Value: form.name },
        ],
      };
      await cognitoClient.send(new SignUpCommand(params));
      setForm(initialValues);
      setMode("signIn");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleSignIn = async () => {
    try {
      const params = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.REACT_APP_AWS_CLIENT_ID,
        AuthParameters: {
          USERNAME: form.username,
          PASSWORD: form.password,
        },
      };
      const response = await cognitoClient.send(
        new InitiateAuthCommand(params)
      );
      const token = response.AuthenticationResult.IdToken;
      const expiresIn = response.AuthenticationResult.ExpiresIn;
      storeToken(token, expiresIn);
      Navigate(ROUTE_CONSTANT.RECORD);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="auth-container">
      <h2 className="auth-heading">
        {mode === "signIn" ? "Sign In" : "Create an Account"}
      </h2>

      <input
        type="email"
        placeholder="Mail ID"
        value={form.username}
        onChange={(e) => handleChange("username", e.target.value)}
        className="auth-input"
      />

      {mode === "signUp" && (
        <>
          <input
            type="text"
            placeholder="User Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className="auth-input"
          />
        </>
      )}

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => handleChange("password", e.target.value)}
        className="auth-input"
      />

      <button
        onClick={mode === "signIn" ? handleSignIn : handleSignUp}
        className="auth-button"
      >
        {mode === "signIn" ? "Sign In" : "Sign Up"}
      </button>

      <p className="toggle-title">
        {mode === "signIn" ? (
          <>
            Don't have an account?{" "}
            <span
              onClick={() => setMode("signUp")}
              className="auth-toggle-link"
            >
              Sign Up
            </span>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <span
              onClick={() => setMode("signIn")}
              className="auth-toggle-link"
            >
              Sign In
            </span>
          </>
        )}
      </p>

      {message && <p className="auth-message">{message}</p>}
    </div>
  );
}

export default AuthUI;
