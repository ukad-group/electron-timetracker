import { Office365User } from "./office365";

export interface JiraUser extends Office365User {
  nickname: string;
}

interface JiraResource {
  id: string;
}

interface JiraResourceData {
  accessToken: string;
  assignee: string;
  resources: JiraResource[];
}

export const updateJiraAccessToken = async (refreshToken: string) => {
  return await global.ipcRenderer.invoke(
    "jira:refresh-access-token",
    refreshToken
  );
};

export const removeJiraStoredUser = (userId: string) => {
  const storedUsers = JSON.parse(localStorage.getItem("jira-users")) || [];
  const filteredUsers = storedUsers.filter(
    (user: JiraUser) => user.userId !== userId
  );

  if (filteredUsers.length > 0) {
    localStorage.setItem("jira-users", JSON.stringify(filteredUsers));
  } else {
    localStorage.removeItem("jira-users");
  }
};

export const updateJiraStoredUser = (
  userId: string,
  newAccessToken: string,
  newRefreshToken: string
) => {
  const storedUsers = JSON.parse(localStorage.getItem("jira-users")) || [];
  const updatedUsers = storedUsers.map((user: JiraUser) => {
    if (user.userId === userId) {
      return {
        ...user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } else {
      return user;
    }
  });

  localStorage.setItem("jira-users", JSON.stringify(updatedUsers));
};

export const getJiraResources = async () => {
  try {
    const storedUsers = JSON.parse(localStorage.getItem("jira-users")) || [];

    if (!storedUsers.length) return [];

    const resourcesPromises = storedUsers.map(async (user: JiraUser) => {
      const { accessToken, refreshToken, userId, nickname } = user;

      return getJiraResourcesByUser(
        accessToken,
        refreshToken,
        userId,
        nickname
      );
    });

    const resources = await Promise.all(resourcesPromises);

    return resources || [];
  } catch (error) {
    console.log("Error while getting resources", error);

    return [];
  }
};

export const getJiraResourcesByUser = async (
  accessToken: string,
  refreshToken: string,
  userId: string,
  nickname: string
) => {
  const resources = await global.ipcRenderer.invoke(
    "jira:get-resources",
    accessToken
  );

  if (resources?.code === 401) {
    const data = await updateJiraAccessToken(refreshToken);

    if (!data?.access_token || !data?.refresh_token) {
      removeJiraStoredUser(userId);
      return;
    } else {
      updateJiraStoredUser(userId, data.access_token, data.refresh_token);

      return await getJiraResourcesByUser(
        data.access_token,
        data.refresh_token,
        userId,
        nickname
      );
    }
  }

  if (resources) return { resources, accessToken, assignee: nickname };

  return [];
};

export const getAllJiraCards = async (resourcesData: JiraResourceData[]) => {
  try {
    if (!resourcesData?.length) return [];

    let cardsPromises = [];

    resourcesData.forEach(async (item) => {
      if (!item) return;

      const { resources, accessToken, assignee } = item;

      if (accessToken && assignee && resources.length > 0) {
        cardsPromises = resources.map(async (resource) => {
          return await getJiraCardsByResourceId(
            resource.id,
            accessToken,
            assignee
          );
        });
      }
    });

    const promisedCards = await Promise.all(cardsPromises);
    const cards = promisedCards.reduce((acc, curr) => {
      if (!curr?.issues?.length) return acc;

      const { issues } = curr;

      const cardsOfResource = issues.map((issue) => issue?.fields?.summary);

      if (!cardsOfResource?.length) {
        return acc;
      } else {
        return [...acc, ...cardsOfResource];
      }
    }, []);

    return cards || [];
  } catch (error) {
    console.log("Error while getting cards", error);

    return [];
  }
};

export const getJiraCardsByResourceId = async (
  resourceId: string,
  accessToken: string,
  assignee: string
) => {
  const cards = await global.ipcRenderer.invoke(
    "jira:get-issues",
    accessToken,
    resourceId,
    assignee
  );

  if (cards) return cards;

  return [];
};
