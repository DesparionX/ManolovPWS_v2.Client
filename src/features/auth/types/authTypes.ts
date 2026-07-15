export interface SignInRequest {
  userNameOrEmail: string;
  password: string;
}

export interface AccessToken {
  token: string;
  expiresAtUtc: string;
}

export interface CompactUserReadModel {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  profilePictureUrl: string | null;
}

export interface SignInApiResponse {
  accessToken: AccessToken;
  user: CompactUserReadModel;
}
