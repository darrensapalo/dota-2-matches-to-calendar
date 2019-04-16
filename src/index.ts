import express from 'express';
import { fetchRecentMatches } from './dota';
import { insertNewDotaMatchesAsCalendarEvents } from './calendar';
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.parseDotaGames = (_request: express.Request, response: express.Response) => {
    
    fetchRecentMatches()
        .pipe(
            insertNewDotaMatchesAsCalendarEvents()
        )
        .subscribe(events => {
            response.status(200).send(`Created a total of ${events.length} event/s.`);
        }, err => {
            let errorMesasge = err.message || err;
            response.status(500).send(`An error ocurred: ${errorMesasge}`);
        });

};


fetchRecentMatches()
    .pipe(
        insertNewDotaMatchesAsCalendarEvents()
    )
    .subscribe(events => {
        console.log(`Created a total of ${events.length} event/s.`);
    }, err => {
        let errorMesasge = err.message || err;
        console.log(`An error ocurred: ${errorMesasge}`);
    });