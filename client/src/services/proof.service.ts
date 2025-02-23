import { Proof as ReclaimProof, ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { httpService } from './http.service';

export type Proof = ReclaimProof;

const APP_ID = '0xbfB817DdcF51E591A1a9261eaDb57F581BB40c04';
const APP_SECRET = '0xcbd3a376cca4aaf5abfb98a76f840e414df9b07d96a471f9dac102fb2dd9cddb';
const PROVIDER_ID = 'a9f1063c-06b7-476a-8410-9ff6e427e637';

interface ProofResponse {
  data: {
    success: boolean;
  };
}

class ProofService {
  async initializeVerificationRequest({
    onSuccess,
    onError,
  }: {
    onSuccess: (proof: Proof) => Promise<void>;
    onError: (error: Error) => Promise<void>;
  }): Promise<string> {
    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);

    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    await reclaimProofRequest.startSession({
      // Called when the user successfully completes the verification
      onSuccess: async (proofs) => {
        if (proofs && typeof proofs !== 'string') onSuccess(Array.isArray(proofs) ? proofs[0] : proofs);
      },
      onError,
    });

    return requestUrl;
  }

  async saveProof(data: {
    public_key: string;
    signature: string;
    signer: string;
    data: Proof;
    provider: string;
  }): Promise<boolean> {
    try {
      const response = await httpService.post<ProofResponse>('/proof', data);
      return response.data.success;
    } catch (error) {
      console.error('Error saving proof:', error);
      throw error;
    }
  }
}

export const proofService = new ProofService();
