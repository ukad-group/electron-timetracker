export const getTrelloAuthUrl = ({
  key,
  returnUrl,
}: {
  key: string;
  returnUrl: string;
}): string => {
  const trelloAuthUrl = new URL("https://trello.com/1/authorize");
  const params = new URLSearchParams({
    expiration: "never",
    name: "Timetracker",
    scope: "read",
    response_type: "fragment",
    key: key,
    return_url: returnUrl,
    callback_method: "fragment",
  });

  trelloAuthUrl.search = params.toString();

  return trelloAuthUrl.toString();
};

export const getBoards = async (token: string, key: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/members/me/boards?key=${key}&token=${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch boards");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching board IDs:", error);
    throw error;
  }
};

export const getCardsOnBoard = async (
  boardId: string,
  token: string,
  key: string
): Promise<any[]> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch cards");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
};
