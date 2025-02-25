import { RECLAIM_CONFIG } from '@/config';
import { Proof as ReclaimProof, ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { httpService } from './http.service';

export type Proof = ReclaimProof;

interface ProofResponse {
  data: {
    success: boolean;
  };
}

class ProofService {
  async initializeVerificationRequest({
    providerId,
    onSuccess,
    onError,
  }: {
    providerId: string;
    onSuccess: (proof: Proof) => Promise<void>;
    onError: (error: Error) => Promise<void>;
  }): Promise<string> {
    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(
      RECLAIM_CONFIG.APP_ID,
      RECLAIM_CONFIG.APP_SECRET,
      providerId,
    );

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
