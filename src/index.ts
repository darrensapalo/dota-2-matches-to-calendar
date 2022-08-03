require('dotenv').config()
import express from "express";
import { fetchRecentMatches } from "./dota";
import { insertNewDotaMatchesAsCalendarEvents } from "./calendar";
import { map } from "rxjs/operators";

const isInDevelopmentMode = process.env.NODE_ENV === "development";

const sendResponse = (response: express.Response, statusCode: number) => {
  return (data: any) => {
    if (isInDevelopmentMode) {
      console.log("Finished processing.");
      console.log(data);
    } else {
      response.status(statusCode).json(data);
    }
  };
};

/**
 * Responds to any HTTP request.
 *
 * @param request
 * @param response
 */
exports.parseDotaGames = (
  request: express.Request,
  response: express.Response
) => {
  const dotaAccountId = request?.query?.dotaAccountId || process.env.DEFAULT_DOTA_ACCOUNT_ID;

  if (typeof dotaAccountId !== "string") {
    sendResponse(response, 400)({
      error: "invalid query parameter `dotaAccountId`; Please specify a valid DotA 2 account."
    });
    return;
  }

  fetchRecentMatches(dotaAccountId)
    .pipe(
      insertNewDotaMatchesAsCalendarEvents(),
      map((events) => ({
        message: "success",
        total: events.length,
        events: events,
      }))
    )
    .subscribe(sendResponse(response, 200), sendResponse(response, 500));
};

if (isInDevelopmentMode) exports.parseDotaGames(null, null);
