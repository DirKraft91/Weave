import { httpService } from './http.service';

export interface Proof {
  email: string;
  username: string;
  provider: string;
  proof_identifier: string;
  created_at: number;
}

interface UserResponse {
  data: {
    id: string;
    proofs: Proof[];
  };
}

class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async fetchMe(): Promise<UserResponse['data']> {
    const response = await httpService.get<UserResponse>(`/me`);
    if (!response.data) {
      throw new Error('No data found');
    }
    return response.data;
  }

  async fetchUserByAddress(address: string): Promise<UserResponse['data']> {
    const response = await httpService.get<UserResponse>(`/user/${address}`);
    if (!response.data) {
      throw new Error('No data found');
    }
    return response.data;
  }
}

export const userService = UserService.getInstance();
