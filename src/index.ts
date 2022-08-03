require('dotenv').config()
import express from "express";
import { map } from "rxjs/operators";
import { insertNewDotaMatchesAsCalendarEvents } from "./calendar";
import { fetchRecentMatches } from "./dota";

const isInDevelopmentMode = process.env.NODE_ENV === "development";

// Initialize sentry.
import * as Sentry from "@sentry/node";
import { GoogleCalendarAuth } from "./utils/gcal";

Sentry.init({
  dsn: "https://57ba9a986bea4855b00d3fe749618e9a@o1344894.ingest.sentry.io/6620971",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const sendResponse = (response: express.Response, statusCode: number) => {
  return (data: any) => {
    if (isInDevelopmentMode) {
      console.log("Finished processing.");
      console.log(data);
    } else {
      response.status(statusCode).json(data);
    }

    if (statusCode !== 200) {
      console.error("Failed to create calendar events");
      console.error(data);
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
  const dotaAccountID = request?.query?.dotaAccountID || process.env.DEFAULT_DOTA_ACCOUNT_ID;
  const calendarID = request?.query?.calendarID || process.env.DEFAULT_CALENDAR_ID;

  if (typeof dotaAccountID !== "string") {
    sendResponse(response, 400)({
      error: "invalid query parameter `dotaAccountID`; Please specify a valid DotA 2 account."
    });
    return;
  }

  if (typeof calendarID !== "string") {
    sendResponse(response, 400)({
      error: "invalid query parameter `calendarID`; Please specify a Google calendar ID."
    });
    return;
  }

  Sentry.setContext("request", {
    dotaAccountID: dotaAccountID,
    calendarID: calendarID,
  });

  fetchRecentMatches(dotaAccountID)
    .pipe(
      insertNewDotaMatchesAsCalendarEvents(new GoogleCalendarAuth(dotaAccountID, calendarID)),
      map((events) => ({
        message: "success",
        total: events.length,
        events: events,
      }))
    )
    .subscribe(sendResponse(response, 200), sendResponse(response, 500));
};

if (isInDevelopmentMode) exports.parseDotaGames(null, null);
