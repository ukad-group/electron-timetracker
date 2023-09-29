"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { getBoards, getCardsOnBoard, getTrelloAuthUrl } from "../API/trelloAPI";
import Button from "../components/ui/Button";

const TRELLO_KEY = process.env.NEXT_PUBLIC_TRELLO_KEY;
const RETURN_URL = process.env.NEXT_PUBLIC_TRELLO_REDIRECT_URI;

const TrelloPage = () => {
  const [token, setToken] = useState("");
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const router = useRouter();

  const handleTrelloConnect = () => {
    const trelloAuthUrl = getTrelloAuthUrl({
      key: TRELLO_KEY,
      returnUrl: RETURN_URL,
    });

    router.push(trelloAuthUrl);
  };

  const handleShowBoards = async () => {
    const data = await getBoards(token, TRELLO_KEY);

    if (data) {
      setBoards(data);
    }
  };

  const handleGetCardsOnBoard = async (boardId: string) => {
    const data = await getCardsOnBoard(boardId, token, TRELLO_KEY);

    if (data) {
      setCards(data);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("trelloToken");
    setToken("");
    setBoards([]);
    setCards([]);
  };

  function extractTokenFromString(inputString: string) {
    const parts = inputString.split("#");

    if (parts.length >= 2) {
      const afterHash = parts[1];
      const tokenPart = afterHash.split("=");

      if (tokenPart.length === 2 && tokenPart[0] === "token") {
        return tokenPart[1];
      }
    }

    return "";
  }

  useEffect(() => { 
    let tokenFromPath = "";

    if (Boolean(localStorage.getItem("trelloToken"))) {
      tokenFromPath = localStorage.getItem("trelloToken") as string;
    } else {
      tokenFromPath = extractTokenFromString(router.asPath);
      localStorage.setItem("trelloToken", tokenFromPath);
    }

    setToken(tokenFromPath);
  }, [token]);

  return (
    <>
      <header className="bg-white shadow">
        <div className="flex items-center justify-between h-16 px-2 mx-auto max-w-[1400px] sm:px-4 lg:px-8">
          <div className="flex items-center flex-shrink min-w-0 gap-4">
            Trello Integration
            {token.length > 0 && (
              <div
                className="text-sm font-medium text-blue-600 p-2 cursor-pointer"
                onClick={handleSignOut}
              >
                SignOut
              </div>
            )}
          </div>
          <Link href="/">
            <div className="flex justify-end items-center flex-shrink min-w-0 gap-4">
              <XMarkIcon
                className="w-6 h-6 cursor-pointer"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </header>

      <main>
        <div className="flex gap-6 flex-col px-6 py-10">
          {token.length === 0 && !token && (
            <Button
              type="button"
              text="Authorize"
              callback={handleTrelloConnect}
            />
          )}

          {token.length > 0 && !boards.length && (
            <Button
              type="button"
              text="Show boards"
              callback={handleShowBoards}
            />
          )}
          {boards.length > 0 && (
            <ul className="flex gap-2 flex-wrap">
              {boards.map((board) => (
                <li key={board.id}>
                  <Button
                    type="button"
                    text={board.name}
                    callback={() => handleGetCardsOnBoard(board.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          {boards.length > 0 && token.length > 0 && cards.length > 0 && (
            <ul>
              <li className="grid grid-cols-[200px_1fr] border p-2 font-bold">
                <div>Date Last Activity</div>
                <div>Card name</div>
              </li>
              {cards.map((cards) => (
                <li
                  key={cards.id}
                  className="grid grid-cols-[200px_1fr] border px-2"
                >
                  <div>{cards.dateLastActivity}</div>
                  <div>{cards.name}</div>
                </li>
              ))}
            </ul>
          )}

          {boards.length > 0 && token.length > 0 && !cards.length && (
            <span>
              There are no cards on the board or the board is not chosen
            </span>
          )}
        </div>
      </main>
    </>
  );
};

export default TrelloPage;
