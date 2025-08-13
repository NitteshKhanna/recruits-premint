"use client";

import React, { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useSignMessage, useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import "./connect-wallet.scss";
import { usePathname } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

interface parentType {
  parentComponent: string;
}

const ConnectWallet: React.FC<parentType> = ({ parentComponent }) => {
  const router = useRouter();
  const [showSignPopup, setShowSignPopup] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const apiurl = process.env.NEXT_PUBLIC_APIURL;
  const {
    data: signature,
    error: signError,
    isPending,
    signMessage,
  } = useSignMessage();

  const path = usePathname();

  const message = `Welcome to Recruits!\n\nPlease sign this message to verify your wallet ownership.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address: ${address}`;

  // Detect when user connects wallet
  useEffect(() => {
    if (isConnected && !signature && address) {
      setShowSignPopup(true);
    }
  }, [isConnected, signature, address]);

  // Handle signing
  const handleSign = () => {
    signMessage({ message });
  };

  // Handle cancellation
  const handleCancel = () => {
    setShowSignPopup(false);
  };

  // After successful signature, send to backend for authentication
  useEffect(() => {
    const authenticateWithBackend = async () => {
      if (!signature || !address) return;

      setIsAuthenticating(true);
      setAuthError(null);

      try {
        const response = await fetch(`${apiurl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicKey: address,
            signature,
            message,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Authentication failed");
        }

        const data = await response.json();

        localStorage.setItem("loginData", JSON.stringify(data));
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          
          // Only redirect to gallery if called from connectWallet page
          if (path === "/connectWallet") {
            router.push("/closet");
          }
        } else {
          throw new Error("No token received from server");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error('Authentication failed');
        setAuthError((error as Error).message);
      } finally {
        setIsAuthenticating(false);
        setShowSignPopup(false);
      }
    };

    if (signature && address) {
      authenticateWithBackend();
    }
  }, [signature, address, message, router]);

  return (
    <>
      <ToastContainer/>
      <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, hide, address, ensName }) => {
          return (
            <button
              onClick={show}
              className={`${
                parentComponent == "connectWalletPage" ? "connectWalletPageBtn" : "connect-wallet-button"
              }`}
              type="button"
            >
              {isConnected ? (
                isAuthenticating ? (
                  <span>Authenticating...</span>
                ) : (
                  <span className="wallet-address">
                    {ensName ||
                      `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </span>
                )
              ) : isConnecting ? (
                <span>Connecting...</span>
              ) : (
                <span>Connect{`${
                parentComponent == "connectWalletPage" ? " your" : ""
              }`} Wallet</span>
              )}
            </button>
          );
        }}
      </ConnectKitButton.Custom>

      {/* Signature Popup */}
      {showSignPopup && (
        <div className="signature-popup-overlay">
          <div className="signature-popup">
            <h3>Signature Request</h3>
            <p className="message-to-sign">{message}</p>

            {signError && (
              <p className="error-message">Error: {signError.message}</p>
            )}
            {authError && (
              <p className="error-message">Authentication Error: {authError}</p>
            )}

            <div className="signature-actions">
              <button
                className="cancel-button"
                onClick={handleCancel}
                disabled={isPending || isAuthenticating}
              >
                Cancel
              </button>
              <button
                className="sign-button"
                onClick={handleSign}
                disabled={isPending || isAuthenticating}
              >
                {isPending ? "Signing..." : "Sign Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectWallet;