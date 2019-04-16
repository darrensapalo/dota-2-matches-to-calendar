"use strict";
exports.__esModule = true;
var dota_1 = require("./dota");
var calendar_1 = require("./calendar");
exports.parseDotaGames = function (_request, response) {
    dota_1.fetchRecentMatches()
        .pipe(calendar_1.insertNewDotaMatchesAsCalendarEvents())
        .subscribe(function (events) {
        response.status(200).send("Created a total of " + events.length + " event/s.");
    }, function (err) {
        var errorMesasge = err.message || err;
        response.status(500).send("An error ocurred: " + errorMesasge);
    });
};
dota_1.fetchRecentMatches()
    .pipe(calendar_1.insertNewDotaMatchesAsCalendarEvents())
    .subscribe(function (events) {
    console.log("Created a total of " + events.length + " event/s.");
}, function (err) {
    var errorMesasge = err.message || err;
    console.log("An error ocurred: " + errorMesasge);
});
//# sourceMappingURL=index.js.map