// server.js
import express from "express";
import { Totp } from "time2fa";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Store user data here (in a real app, you would store this in a database)
let userSecrets = {};

// Endpoint to generate 2FA secret and QR code
app.post("/generate-2fa", (req, res) => {
  const { username } = req.body;

  // Generate a new secret key for the user
  const key = Totp.generateKey({ issuer: "sai", user: username });

  userSecrets[username] = key;

  res.json({
    secret: key.secret,
    url: key.url,
  });
});

// Endpoint to verify the OTP
app.post("/verify-2fa", (req, res) => {
  try {
    const { username, token } = req.body;

    if (!username || !token) {
      return res
        .status(400)
        .json({ success: false, message: "Username and token are required." });
    }

    const userSecretData = userSecrets[username];

    if (!userSecretData || !userSecretData.secret) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or secret missing." });
    }

    const isTokenValid = Totp.validate({
      passcode: token,
      secret: userSecretData.secret,
    });

    if (!isTokenValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    console.error("Error verifying 2FA token:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
