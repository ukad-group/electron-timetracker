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
  idMembers: string[];
};

type Member = {
  id: string;
  username: string;
};

type Board = {
  id: string;
};

type ReturnedCardsData = {
  assignedCards: Card[];
  notAssignedCards: Card[];
};

export const getTrelloMember = async ({
  accessToken,
  options,
}: {
  accessToken: string;
  options: Options;
}): Promise<Member> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/members/me?key=${options.key}&token=${accessToken}`
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching member:", error);
    throw error;
  }
};

export const getTrelloCardsOfAllBoards = async ({
  memberId,
  options,
  accessToken,
}: {
  memberId: string;
  options: Options;
  accessToken: string;
}): Promise<ReturnedCardsData> => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/members/${memberId}/boards?key=${options.key}&token=${accessToken}`
    );
    const boards = await response.json();
    const cardsListsPromises = boards.map(async (board: Board) => {
      return await fetch(
        `https://api.trello.com/1/boards/${board.id}/cards?key=${options.key}&token=${accessToken}`
      );
    });

    const cardsListsResponses = await Promise.all(cardsListsPromises);
    const cardsLists = await Promise.all(
      cardsListsResponses.map(async (list) => await list.json())
    );
    const cards = cardsLists.reduce((acc, item) => [...acc, ...item], []);
    const assignedCards = cards.filter((card: Card) =>
      card?.idMembers?.includes(memberId)
    );
    const notAssignedCards = cards.filter(
      (card: Card) => !card?.idMembers?.includes(memberId)
    );

    return { assignedCards, notAssignedCards };
  } catch (error) {
    console.error("Error fetching Trello cards of all member's boards:", error);

    return { assignedCards: [], notAssignedCards: [] };
  }
};
