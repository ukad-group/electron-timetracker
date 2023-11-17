import { Options } from "./helpers/API/office365Api";

export const getAzureAuthUrl = (options: Options) => {
  const { clientId, scope, redirectUri } = options;
  const authUrl = new URL(
    "https://login.microsoftonline.com/22c676eb-cbe8-4058-b9da-f58799142fbe/oauth2/v2.0/authorize"
  );

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    prompt: "select_account",
    response_type: "code",
    state: "azure-base",
  });

  authUrl.search = params.toString();

  return authUrl.toString();
};

export const getAzureAuthUrlAdditional = (options: Options) => {
  const { clientId, scope, redirectUri } = options;
  const authUrl = new URL(
    "https://login.microsoftonline.com/22c676eb-cbe8-4058-b9da-f58799142fbe/oauth2/v2.0/authorize"
  );

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    prompt: "none",
    response_type: "code",
    state: "azure-additional",
  });

  authUrl.search = params.toString();

  return authUrl.toString();
};

export const getAzureTokens = async (authCode: string, options: Options) => {
  if (!authCode) return;

  const { clientId, clientSecret, redirectUri, scope } = options;
  const response = await fetch(
    "https://login.microsoftonline.com/22c676eb-cbe8-4058-b9da-f58799142fbe/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `code=${authCode}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code&scope=${scope}`,
    }
  );

  if (!response.ok) throw new Error();

  return response.json();
};

export const getRefreshedUserInfoToken = async (
  refreshToken: string,
  options: Options
) => {
  const { clientId, clientSecret, scope } = options;
  const response = await fetch(
    "https://login.microsoftonline.com/22c676eb-cbe8-4058-b9da-f58799142fbe/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&scope=${scope}`,
    }
  );

  if (!response.ok) throw new Error();

  return response.json();
};

export const getPlannerTokens = async (authCode: string, options: Options) => {
  if (!authCode) return;

  const { clientId, clientSecret, redirectUri, scope } = options;
  const response = await fetch(
    "https://login.microsoftonline.com/22c676eb-cbe8-4058-b9da-f58799142fbe/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `code=${authCode}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code&scope=${scope}`,
    }
  );

  if (!response.ok) throw new Error();

  return response.json();
};

export const getRefreshedPlannerToken = async (
  refreshToken: string,
  options: Options
) => {
  const { clientId, clientSecret, scope } = options;
  const response = await fetch(
    "https://login.microsoftonline.com/22c676eb-cbe8-4058-b9da-f58799142fbe/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&scope=${scope}`,
    }
  );

  if (!response.ok) throw new Error();

  return response.json();
};

export const getTimetrackerHolidays = async (token: string) => {
  const currentYear = new Date().getFullYear().toString();

  const response = await fetch(
    `https://app-pto-planner-api-prod.azurewebsites.net/Periods/getHolidaysForYear/${currentYear}`,
    {
      mode: "cors",
      headers: {
        "Accept-Language": "en-US",
        Authorization: `Bearer ${token}`,
        "Access-Control-Allow-Origin": "*",
      },
    }
  );

  if (!response.ok) {
    const authStatus = response.headers.get("www-authenticate");

    if (authStatus?.includes("invalid_token")) {
      return "invalid_token";
    } else {
      throw new Error();
    }
  }

  return response.json();
};

export const getTimetrackerVacations = async (token: string, email: string) => {
  const currentYear = new Date().getFullYear().toString();

  const response = await fetch(
    `https://app-pto-planner-api-prod.azurewebsites.net/Users/getUserInfoByEmail/${email}/${currentYear}`,
    {
      mode: "cors",
      headers: {
        "Accept-Language": "en-US",
        Authorization: `Bearer ${token}`,
        "Access-Control-Allow-Origin": "*",
      },
    }
  );

  if (!response.ok) {
    const authStatus = response.headers.get("www-authenticate");

    if (authStatus?.includes("invalid_token")) {
      return "invalid_token";
    } else {
      throw new Error();
    }
  }

  return response.json();
};

export const getTimetrackerCookie = async (idToken: string) => {
  let formData = new FormData();
  formData.append("Id_Token", idToken);
  formData.append("IsShouldRedirect", "false");

  const response = await fetch("https://tt-api.ukad-demo.com/auth/login", {
    method: "post",
    mode: "cors",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) throw new Error();

  const cookie = response.headers.get("set-cookie");

  return cookie;
};

export const getTimetrackerProjects = async (cookie: string) => {
  const response = await fetch(
    "https://tt-api.ukad-demo.com/json/projects/peryear",
    {
      headers: {
        Cookie: cookie,
      },
    }
  );

  if (!response.ok && response.status === 401) {
    return "invalid_token";
  } else if (!response.ok) {
    throw new Error();
  }

  return response.json();
};
