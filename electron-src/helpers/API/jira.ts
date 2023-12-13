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
    prompt: "select_account",
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

  return response.json();
};

export const getJiraRefreshedAccessToken = async (
  refreshToken: string,
  options: Options
) => {
  const { clientId, clientSecret, scope } = options;
  const response = await fetch("https://auth.atlassian.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  return response.json();
};

export const getJiraProfile = async (accessToken: string) => {
  const endpoint = "https://api.atlassian.com/me";
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const getJiraResources = async (accessToken: string) => {
  const endpoint = "https://api.atlassian.com/oauth/token/accessible-resources";
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);
  headers.append("Accept", "application/json");

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const getJiraIssues = async (
  accessToken: string,
  resourceId: string,
  assignee: string
) => {
  const jqlQuery = `assignee = "${assignee}" ORDER BY created DESC`;
  const endpoint = `https://api.atlassian.com/ex/jira/${resourceId}/rest/api/3/search?jql=${encodeURIComponent(
    jqlQuery
  )}&maxResults=100&fields=summary`;
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);
  headers.append("Accept", "application/json");

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
};
