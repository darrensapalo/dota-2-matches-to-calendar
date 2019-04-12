import express from 'express';
import { fetchRecentMatches } from './dota';
import './calendar';

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.parseDotaGames = (request: express.Request, response: express.Response) => {
    let limit = request.query.limit || request.body.limit || 5;

    fetchRecentMatches().subscribe(console.log, console.error);

    response.status(200).send(limit);
};

// fetchRecentMatches().subscribe(console.log, console.error);