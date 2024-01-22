export type Options = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
};

export const getGoogleAuthUrl = (options: Options): string => {
  const { clientId, scope, redirectUri } = options;
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/auth");

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    access_type: "offline",
    response_type: "code",
    state: "googlecalendarcode",
  });

  googleAuthUrl.search = params.toString();

  return googleAuthUrl.toString();
};
