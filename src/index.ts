import express from 'express';
import { fetchRecentMatches } from './dota';
import { insertNewDotaMatchesAsCalendarEvents } from './calendar';
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.parseDotaGames = (_request: (express.Request|null), response: (express.Response|null)) => {
    
    fetchRecentMatches()
        .pipe(
            insertNewDotaMatchesAsCalendarEvents()
        )
        .subscribe(events => {

            if (response === null) {
                console.log(`Successfully generated ${events.length} events.`);
                console.log(JSON.stringify(events, null, 2));
                return;
            }

            response.status(200).json({
                message: 'success',
                total: events.length,
                events: events
            });
        }, err => {
            let errorMessage = err.message || err;
            if (response === null) {
                console.error(`An error occurred:`);
                console.error(err);
                return;
            }
            response.status(500).send(`An error ocurred: ${errorMessage}`);
        });

};

exports.parseDotaGames(null, null);