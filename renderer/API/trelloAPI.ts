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

export const getBoards = async ({
  token,
  key,
}: {
  token: string;
  key: string;
}): Promise<any[]> => {
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

export const getCardsOnBoard = async ({
  boardId,
  token,
  key,
}: {
  boardId: string;
  token: string;
  key: string;
}): Promise<any[]> => {
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

export const getMemberId = async ({
  token,
  key,
}: {
  token: string;
  key: string;
}): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/members/me?key=${key}&token=${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch member");
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error fetching member:", error);
    throw error;
  }
};

export const getCardsOfMember = async ({
  token,
  key,
}: {
  token: string;
  key: string;
}): Promise<any[]> => {
  try {
    const memberId = await getMemberId({ token, key });

    if (!memberId) {
      throw new Error("Failed to fetch member");
    }

    const response = await fetch(
      `https://api.trello.com/1/members/${memberId}/cards?key=${key}&token=${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch cards of a member");
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching cards of a member:", error);
    throw error;
  }
};
