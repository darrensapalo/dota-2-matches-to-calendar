import express from 'express';
import {fetchRecentMatches} from './dota';
import {insertNewDotaMatchesAsCalendarEvents} from './calendar';
import {map} from "rxjs/operators";

const isInDevelopmentMode = process.env.NODE_ENV === 'development';

const sendResponse = (response: express.Response, statusCode: number) => {
  return (data) => {
    if (isInDevelopmentMode) {
      console.log("Finished processing.");
      console.log(data);
    } else {
      response.status(statusCode).json(data);
    }

  }
};

/**
 * Responds to any HTTP request.
 *
 * @param request
 * @param response
 */
exports.parseDotaGames = (request: express.Request, response: express.Response) => {

  let dotaAccountId: string;
  if (isInDevelopmentMode) {
    dotaAccountId = "102817660";
  } else {
    dotaAccountId = request.query.dotaAccountId || "102817660";
  }

  fetchRecentMatches(dotaAccountId)
    .pipe(
      insertNewDotaMatchesAsCalendarEvents(),
      map(events => ({
        message: 'success',
        total: events.length,
        events: events
      }))
    )
    .subscribe(
      sendResponse(response, 200),
      sendResponse(response, 500)
    );

};

if (process.env.NODE_ENV === 'development')
  exports.parseDotaGames(null, null);
