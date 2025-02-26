import { RECLAIM_CONFIG } from '@/config';
import { Proof as ReclaimProof, ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { httpService } from './http.service';

export type Proof = ReclaimProof;

export interface ProofStats {
  [providerId: string]: number;
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

  async prepareProof(payload: { proof: Proof; provider_id: string; signer: string }): Promise<{
    data: Uint8Array;
    signer: string;
  }> {
    return await httpService.post<{
      data: Uint8Array;
      signer: string;
    }>('/proof/prepare', payload);
  }

  async applyProof(payload: {
    public_key: string;
    signature: string;
    signer: string;
    data: Uint8Array;
    proof: Proof;
    provider_id: string;
  }): Promise<{ success: boolean }> {
    return await httpService.post<{
      success: boolean;
    }>('/proof', payload);
  }

  async fetchProofStats(): Promise<ProofStats> {
    const response = await httpService.post<{ stats: [string, number][] }>('/proof-stats');

    // Transform the array of tuples into an object for easier access
    return response.stats.reduce((acc, [providerId, count]) => {
      acc[providerId] = count;
      return acc;
    }, {} as ProofStats);
  }
}

export const proofService = new ProofService();
