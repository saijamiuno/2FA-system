import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const TwoFactorAuth = () => {
  const [username, setUsername] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [token, setToken] = useState("");
  const [verificationMessage, setVerificationMessage] = useState(null);
  console.log(verificationMessage, "verificationMessage");
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  const generate2FA = async () => {
    try {
      if (!username) {
        return new Promise((_, reject) => {
          reject(new Error("Please check your username"));
          setVerificationMessage("Please check your username");
        });
      }
      setLoading(true);
      setQrLoading(true);
      const response = await axios.post("http://localhost:5000/generate-2fa", {
        username,
      });
      setOtpauthUrl(response.data.url);
      setIs2FAEnabled(true);
      setVerificationMessage(null);
    } catch (error) {
      console.error(error);
      setVerificationMessage(
        "Failed to enable 2FA. Please check your username and try again."
      );
    } finally {
      setLoading(false);
      setQrLoading(false);
    }
  };

  // Verify OTP token
  const verify2FA = async () => {
    try {
      setLoading(true);
      const result = await axios.post("http://localhost:5000/verify-2fa", {
        username,
        token,
      });
      if (result.data.success) {
        setVerificationMessage(result.data.message);
      }
    } catch (error) {
      setVerificationMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Two-Factor Authentication
        </h1>

        <div className="mb-4">
          <Label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="mt-1 w-full"
          />
          <Button
            onClick={generate2FA}
            disabled={loading}
            className={cn(
              "mt-4 w-full",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? "Loading..." : "Enable 2FA"}
          </Button>
        </div>

        {is2FAEnabled && (
          <div className="mb-6">
            <div className="flex justify-center">
              {qrLoading ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Loading QR Code...
                </p>
              ) : (
                <QRCodeCanvas
                  value={otpauthUrl}
                  size={256}
                  className="rounded-md border border-gray-300 dark:border-gray-700"
                />
              )}
            </div>
          </div>
        )}

        {is2FAEnabled && (
          <div className="mb-4">
            <Label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enter OTP
            </Label>
            <Input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter the OTP from your authenticator app"
              className="mt-1 w-full"
            />
            <Button
              onClick={verify2FA}
              disabled={loading}
              className={cn(
                "mt-4 w-full",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        )}

        {verificationMessage && (
          <p
            className={cn(
              "text-center mt-4",
              verificationMessage.includes("successfully")
                ? "text-green-500"
                : "text-red-500"
            )}
          >
            {verificationMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;
