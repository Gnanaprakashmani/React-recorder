import React, { useState } from "react";
import { ReactComponent as EmailIcon } from "./assests/emailIcon.svg";
import { ReactComponent as PasswordIcon } from "./assests/passwordIcon.svg";
import { ReactComponent as UserNameIcon } from "./assests/userIcon.svg";
import { ReactComponent as PhoneIcon } from "./assests/phone.svg";
import { ReactComponent as Logo } from "./assests/appIcon.svg";
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
  const [isLoading, setIsLoading] = useState(false);
  const Navigate = useNavigate();

  const handleSignUp = async () => {
    setIsLoading(true);
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
      console.log(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
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
      console.log(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="auth-container">
      {/* <h2 className="auth-heading">
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

      {message && <p className="auth-message">{message}</p>} */}

      <form class="form_container">
        <div class="logo_container">
          <Logo />
        </div>
        <div class="title_container">
          <p class="title">
            {mode === "signIn" ? "Sign In" : "Create an Account"}
          </p>
        </div>
        <div class="input_container">
          <label class="input_label" for="email_field">
            Email
          </label>
          <EmailIcon className="icon" />
          <input
            type="email"
            placeholder="Mail ID"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            class="input_field"
            id="email_field"
          />
        </div>
        {mode === "signUp" && (
          <div className="input_container">
            <div class="input_container">
              <label class="input_label" for="username_field">
                User Name
              </label>
              <UserNameIcon className="icon" />
              <input
                type="text"
                placeholder="User Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                class="input_field"
                id="username_field"
              />
            </div>
            <br />
            <div class="input_container">
              <label class="input_label" for="phone_field">
                Phone Number
              </label>
              <PhoneIcon className="icon" />
              <input
                type="text"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                class="input_field"
                id="phone_field"
              />
            </div>
          </div>
        )}

        <div class="input_container">
          <label class="input_label" for="password_field">
            Password
          </label>
          <PasswordIcon className="icon" />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            class="input_field"
            id="password_field"
          />
        </div>
        <button
          type="button"
          onClick={mode === "signIn" ? handleSignIn : handleSignUp}
          class="sign-in_btn"
        >
          {isLoading ? (
            <div class="spinner">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            <span>{mode === "signIn" ? "Sign In" : "Sign Up"}</span>
          )}
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
      </form>
    </div>
  );
}

export default AuthUI;
