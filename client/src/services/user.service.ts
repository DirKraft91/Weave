import { httpService } from './http.service';

export interface Proof {
  email?: string;
  username?: string;
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

  fetchMe(): Promise<UserResponse['data']> {
    return httpService.get<UserResponse['data']>(`/me`);
  }

  fetchUserByAddress(address: string): Promise<UserResponse['data']> {
    return httpService.get<UserResponse['data']>(`/user/${address}`);
  }
}

export const userService = UserService.getInstance();
