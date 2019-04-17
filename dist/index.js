"use strict";
exports.__esModule = true;
var dota_1 = require("./dota");
var calendar_1 = require("./calendar");
exports.parseDotaGames = function (_request, response) {
    dota_1.fetchRecentMatches()
        .pipe(calendar_1.insertNewDotaMatchesAsCalendarEvents())
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