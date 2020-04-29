import express from 'express';
import {fetchRecentMatches} from './dota';
import {insertNewDotaMatchesAsCalendarEvents} from './calendar';

/**
 * Responds to any HTTP request.
 *
 * @param request
 * @param response
 */
exports.parseDotaGames = (request: express.Request, response: express.Response) => {

    fetchRecentMatches()
        .pipe(
            insertNewDotaMatchesAsCalendarEvents()
        )
        .subscribe(events => {

            if (response === null) {
                console.log(`Successfully generated ${events.length} events.`);
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
            response.status(500).send(`An error occurred: ${errorMessage}`);
        });

};

/**
 * In case I want to run it locally.
 */
if (process.env.NODE_ENV === 'local') {
    exports.parseDotaGames(null, null);
}
