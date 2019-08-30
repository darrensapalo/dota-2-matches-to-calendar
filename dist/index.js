"use strict";
exports.__esModule = true;
var dota_1 = require("./dota");
var calendar_1 = require("./calendar");
exports.parseDotaGames = function (_request, response) {
    dota_1.fetchRecentMatches()
        .pipe(calendar_1.insertNewDotaMatchesAsCalendarEvents())
        .subscribe(function (events) {
        if (response === null) {
            console.log("Successfully generated " + events.length + " events.");
            console.log(JSON.stringify(events, null, 2));
            return;
        }
        response.status(200).json({
            message: 'success',
            total: events.length,
            events: events
        });
    }, function (err) {
        var errorMessage = err.message || err;
        if (response === null) {
            console.error("An error occurred:");
            console.error(err);
            return;
        }
        response.status(500).send("An error ocurred: " + errorMessage);
    });
};
//# sourceMappingURL=index.js.map