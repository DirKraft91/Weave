import { httpService } from './http.service';

export interface UserIdentityRecord {
  proof_identifier: string;
  public_data: Record<string, string>;
  provider_id: string;
  claim_data_params: string;
  created_at: number;
}

export interface User {
  id: string;
  identity_records: UserIdentityRecord[];
}

interface UserResponse {
  data: User;
}

class UserService {
  private static instance: UserService;

  private constructor() { }

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
