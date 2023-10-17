import { useEffect } from "react";
import Button from "../ui/Button";
import { useGoogleCalendarStore } from "../../store/googleCalendarStore";
import { useRouter } from "next/router";
import {
  getGoogleAuthUrl,
  getGoogleCredentials,
  getGoogleUsername,
  updateGoogleCredentials,
} from "../../API/googleCalendarAPI";

function GoogleCalendarAuth() {
  const { isLogged, setIsLogged, setGoogleUsername, googleUsername } =
    useGoogleCalendarStore();
  const router = useRouter();

  const signInHandler = () => {
    const googleAuthUrl = getGoogleAuthUrl();
    router.push(googleAuthUrl);
  };

  const signOutHandler = () => {
    localStorage.removeItem("googleAccessToken");
    localStorage.removeItem("googleRefreshToken");
    localStorage.removeItem("googleEvents");
    setIsLogged(false);
    router.push("/settings");
  };

  const loadGoogleCredentials = async (authorizationCode: string) => {
    try {
      const credentials = await getGoogleCredentials(authorizationCode);
      localStorage.setItem("googleAccessToken", credentials.access_token);
      localStorage.setItem("googleRefreshToken", credentials.refresh_token);
      setIsLogged(true);
      loadGoogleUsername(credentials.access_token);
    } catch (e) {
      console.error(e);
    }
  };

  const loadGoogleUsername = async (gToken: string) => {
    try {
      const data = await getGoogleUsername(gToken);

      // detect expired token
      if (data?.error && data?.error?.code === 401) {
        const refreshToken = localStorage.getItem("googleRefreshToken");
        const updatedCredentials = await updateGoogleCredentials(refreshToken);
        const newAccessToken = updatedCredentials?.access_token;
        localStorage.setItem("googleAccessToken", newAccessToken);
        loadGoogleUsername(newAccessToken);
        return;
      }

      const googleProfileUsername = data?.names[0]?.displayName;
      setGoogleUsername(googleProfileUsername);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const googleAccessToken = localStorage.getItem("googleAccessToken");
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code"); // detect redirection from auth page

    if (googleAccessToken) {
      setIsLogged(true);
      loadGoogleUsername(googleAccessToken);
    } else if (authorizationCode) {
      loadGoogleCredentials(authorizationCode);
    }
  }, [googleUsername]);

  return (
    <div className="flex-shrink-0">
      {isLogged ? (
        <Button text="Sign Out" callback={signOutHandler} type="button" />
      ) : (
        <Button text="Sign In" callback={signInHandler} type="button" />
      )}
    </div>
  );
}

export default GoogleCalendarAuth;
