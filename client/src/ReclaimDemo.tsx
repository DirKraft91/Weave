import React, { useState } from "react";
import QRCode from "react-qr-code";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

export function ReclaimDemo() {
  // State to store the verification request URL
  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState([]);

  const getVerificationReq = async () => {
    // Your credentials from the Reclaim Developer Portal
    // Replace these with your actual credentials

    const APP_ID = "0xA5252cC9919b29cc169371177f86F938542fb28e";
    const APP_SECRET =
      "0x0fbaf22253010012b8ce57760f23cda7041096ee1a93f62eedded58f8a3dc298";
    const PROVIDER_ID = "71901e6a-0548-414f-affb-c60d66e9648g";

    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      PROVIDER_ID
    );

    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    console.log("Request URL:", requestUrl);

    setRequestUrl(requestUrl);

    // Start listening for proof submissions
    await reclaimProofRequest.startSession({
      // Called when the user successfully completes the verification
      onSuccess: async (proofs) => {
        // Add your success logic here, such as:
        // - Updating UI to show verification success
        // - Storing verification status
        // - Redirecting to another page
        if (proofs && typeof proofs !== "string") {
          console.log("Proof received:", proofs?.claimData.context);

          // Send the proof to your backend service for Prism integration
          try {
            const response = await fetch("http:/localhost:8080/validate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ proof: proofs }),
            });
            const result = await response.json();
            console.log("Proof registered successfully:", result);
          } catch (error) {
            console.error("Failed to register proof:", error);
          }

          console.log("Verification success", proofs);
          setProofs(proofs as any);
        } else {
          console.error("Invalid proof:", proofs);
        }
      },
      // Called if there's an error during verification
      onError: (error) => {
        console.error("Verification failed", error);

        // Add your error handling logic here, such as:
        // - Showing error message to user
        // - Resetting verification state
        // - Offering retry options
      },
    });
  };

  return (
    <>
      <button onClick={getVerificationReq}>Get Verification Request</button>

      {/* Display QR code when URL is available */}

      {requestUrl && (
        <div style={{ margin: "20px 0" }}>
          <QRCode value={requestUrl} />
        </div>
      )}

      {proofs && (
        <div>
          <h2>Verification Successful!</h2>
          <pre>{JSON.stringify(proofs, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
