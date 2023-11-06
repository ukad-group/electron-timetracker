type Options = {
  key: string;
  returnUrl: string;
};

export const getTrelloAuthUrl = (options: Options): string => {
  const { key, returnUrl } = options;
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

type Card = {
  id: string;
  name: string;
  shortUrl: string;
};

type Member = {
  id: string;
  username: string;
};

export const getMember = async (
  token: string,
  options: Options
): Promise<Member> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/members/me?key=${options.key}&token=${token}`
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching member:", error);
    throw error;
  }
};

export const getCardsOfMember = async (
  token: string,
  options: Options
): Promise<Card[]> => {
  try {
    const member = await getMember(token, options);

    const response = await fetch(
      `https://api.trello.com/1/members/${member.id}/cards?key=${options.key}&token=${token}`
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
