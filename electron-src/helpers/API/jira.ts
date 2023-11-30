export type Options = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
};

export const getJiraAuthUrl = (options: Options) => {
  const { clientId, scope, redirectUri } = options;
  const authUrl = new URL("https://auth.atlassian.com/authorize");

  const params = new URLSearchParams({
    audience: "api.atlassian.com",
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: "jiracode",
    response_type: "code",
    prompt: "consent",
  });

  authUrl.search = params.toString();

  return authUrl.toString();
};

export const getJiraTokens = async (authCode: string, options: Options) => {
  if (!authCode) return;

  const { clientId, clientSecret, redirectUri, scope } = options;
  const response = await fetch("https://auth.atlassian.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `code=${authCode}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code&scope=${scope}`,
  });

  // if (!response.ok) throw new Error();

  return response.json();
};

export const getRefreshedAccessToken = async (
  refreshToken: string,
  options: Options
) => {
  const { clientId, clientSecret, scope } = options;
  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&scope=${scope}`,
    }
  );

  // if (!response.ok) throw new Error();

  return response.json();
};
const jqlQuery = `assignee = "Artur Nahaitsev" ORDER BY created DESC`;

export const endpoints = {
  events: `https://api.atlassian.com/ex/jira/92cd10eb-2102-4be8-a47b-5e70e19a2322/rest/api/3/search?jql=${encodeURIComponent(
    jqlQuery
  )}&maxResults=100&fields=summary`,
  me: "https://api.atlassian.com/me",
  resources: "https://api.atlassian.com/oauth/token/accessible-resources",
};

export async function getJiraProfile(accessToken: string) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoints.me, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function getJiraResources(accessToken: string) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);
  headers.append("Accept", "application/json");

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoints.resources, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function getJiraIssue(accessToken: string) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);
  headers.append("Accept", "application/json");

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoints.events, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}
