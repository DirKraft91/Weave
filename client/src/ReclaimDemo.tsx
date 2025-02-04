import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Proof, ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

export function ReclaimDemo() {
  // State to store the verification request URL
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState([]);

  const validateProof = async (proofs: Proof | Proof[]) => {
    try {
      const response = await fetch('http://localhost:8080/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof: proofs, provider: 'google' }),
      });
      const result = await response.json();
      console.log('Proof registered successfully:', result);
    } catch (error) {
      console.error('Failed to register proof:', error);
    }
  };

  const getVerificationReq = async () => {
    // Your credentials from the Reclaim Developer Portal
    // Replace these with your actual credentials

    const APP_ID = '0xbfB817DdcF51E591A1a9261eaDb57F581BB40c04';
    const APP_SECRET = '0xcbd3a376cca4aaf5abfb98a76f840e414df9b07d96a471f9dac102fb2dd9cddb';
    const PROVIDER_ID = 'f9f383fd-32d9-4c54-942f-5e9fda349762';

    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);

    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    console.log('Request URL:', requestUrl);

    setRequestUrl(requestUrl);

    // Start listening for proof submissions
    await reclaimProofRequest.startSession({
      // Called when the user successfully completes the verification
      onSuccess: async (proofs) => {
        // Add your success logic here, such as:
        // - Updating UI to show verification success
        // - Storing verification status
        // - Redirecting to another page
        if (proofs && typeof proofs !== 'string') {
          console.log('Proof received:', proofs?.claimData.context);

          // Send the proof to your backend service for Prism integration
          validateProof(proofs);

          console.log('Verification success', proofs);
          setProofs(proofs as any);
        } else {
          console.error('Invalid proof:', proofs);
        }
      },
      // Called if there's an error during verification
      onError: (error) => {
        console.error('Verification failed', error);

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
        <div style={{ margin: '20px 0' }}>
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
