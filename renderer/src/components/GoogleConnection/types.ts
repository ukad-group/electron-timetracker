export type GoogleCredentails = {
  access_token: string;
  refresh_token: string;
};

export type GoogleUser = {
  googleAccessToken: string;
  googleRefreshToken: string;
  userName: string;
  accountId: string;
};
