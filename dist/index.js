import { fetchRecentMatches } from './dota';
import { insertNewDotaMatchesAsCalendarEvents } from './calendar';
exports.parseDotaGames = function (_request, response) {
    fetchRecentMatches()
        .pipe(insertNewDotaMatchesAsCalendarEvents())
        .subscribe(function (events) {
        response.status(200).json({
            message: 'success',
            total: events.length,
            events: events
        });
    }, function (err) {
        var errorMesasge = err.message || err;
        response.status(500).send("An error ocurred: " + errorMesasge);
    });
};
//# sourceMappingURL=index.js.map