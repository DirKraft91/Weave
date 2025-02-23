import { httpService } from './http.service';

export interface Proof {
  email: string;
  username: string;
  provider: string;
  proof_identifier: string;
  created_at: number;
}

interface SearchResponse {
  data: {
    id: string;
    proofs: Proof[];
  };
}

class SearchService {
  private static instance: SearchService;

  private constructor() { }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  async searchWallets(address: string): Promise<SearchResponse['data'] | null> {
    try {
      const response = await httpService.get<SearchResponse>(`/user/${address}`);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return null;
    }
  }
}

export const searchService = SearchService.getInstance();
