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

type Board = {
  id: string;
};

export const getBoards = async ({
  token,
  key,
}: {
  token: string;
  key: string;
}): Promise<Board[]> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/members/me/boards?key=${key}&token=${token}`
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching board IDs:", error);
    throw error;
  }
};

type Card = {
  id: string;
  name: string;
  shortUrl: string;
};

export const getCardsOnBoard = async ({
  boardId,
  token,
  key,
}: {
  boardId: string;
  token: string;
  key: string;
}): Promise<Card[]> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
};

type Member = {
  id: string;
  username: string;
};

export const getMember = async ({
  token,
  key,
}: {
  token: string;
  key: string;
}): Promise<Member> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/members/me?key=${key}&token=${token}`
    );

    const data = await response.json();
    return data;
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
}): Promise<Card[]> => {
  try {
    const member = await getMember({ token, key });

    const response = await fetch(
      `https://api.trello.com/1/members/${member.id}/cards?key=${key}&token=${token}`
    );

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
