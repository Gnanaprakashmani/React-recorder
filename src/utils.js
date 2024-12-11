import { S3Client } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { authToken } from "./constant/tokenConstant";

export const getCognitoCredentials = async () => {
  const idToken = localStorage.getItem(authToken);

  if (!idToken) {
    console.error("ID token is missing from localStorage.");
    return null;
  }

  try {
    const s3Client = new S3Client({
      region: "eu-north-1",
      credentials: fromCognitoIdentityPool({
        clientConfig: { region: "eu-north-1" },
        identityPoolId: "eu-north-1:e7ab96a6-517e-4d9d-9ef3-f16e05900c22",
        logins: {
          "cognito-idp.eu-north-1.amazonaws.com/eu-north-1_6MKndEDke": idToken,
        },
      }),
    });

    return s3Client;
  } catch (error) {
    console.error("Error creating S3Client:", error);
    return null;
  }
};
export const getToken = () => {
  const tokenData = JSON.parse(localStorage.getItem(authToken));

  if (!tokenData) {
    return null;
  }

  const { token, expirationTime } = tokenData;
  if (new Date().getTime() > expirationTime) {
    localStorage.removeItem(authToken);
    return null;
  }

  return token;
};

export const storeToken = (token, expiryDurationInMinutes) => {
  const expirationTime =
    new Date().getTime() + expiryDurationInMinutes * 60 * 1000;
  const tokenData = {
    token,
    expirationTime,
  };

  localStorage.setItem("authToken", JSON.stringify(tokenData));
};
