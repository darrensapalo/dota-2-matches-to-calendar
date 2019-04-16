"use strict";
exports.__esModule = true;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var rx_http_request_1 = require("@akanass/rx-http-request");
var time_1 = require("./utils/time");
var heroes_1 = require("./constants/heroes");
function mapToDotaMatches(array) {
    return array;
}
function getRelevantDetails(match) {
    return {
        match_id: match.match_id,
        start_time: match.start_time,
        duration: match.duration,
        assists: match.assists,
        deaths: match.deaths,
        kills: match.kills,
        player_slot: match.player_slot,
        radiant_win: match.radiant_win,
        hero_id: match.hero_id
    };
}
function fetchRecentMatches(user_account_id) {
    var account_id = process.env.ACCOUNT_ID || user_account_id || '102817660';
    var URI = "https://api.opendota.com/api/players/" + account_id + "/recentMatches";
    return rx_http_request_1.RxHR.get(URI)
        .pipe(operators_1.map(function (response) { return response.body; }), operators_1.map(function (body) { return JSON.parse(body); }), operators_1.map(mapToDotaMatches), operators_1.concatMap(function (matches) { return rxjs_1.from(matches); }), operators_1.map(getRelevantDetails), operators_1.toArray());
}
exports.fetchRecentMatches = fetchRecentMatches;
function dotaMatchToCalendarEvent(dotaMatch) {
    var heroID = dotaMatch.hero_id;
    var heroName = getHeroName(heroID);
    var isWin = dotaMatch.radiant_win && getTeam(dotaMatch.player_slot) == 'radiant';
    var winLabel = isWin ? 'W' : 'L';
    var startTime = time_1.numberToMoment(dotaMatch.start_time);
    var duration = dotaMatch.duration;
    var endTime = time_1.numberToMoment(dotaMatch.start_time).add(duration, 's');
    var kdaRating = dotaMatch.kills + dotaMatch.deaths;
    if (dotaMatch.assists != 0) {
        kdaRating = kdaRating / dotaMatch.assists;
    }
    var kdaRatingStr = "" + kdaRating.toFixed(2);
    return {
        summary: "DotA 2 (" + winLabel + ") - " + heroName,
        location: "Heneral M. Capinpin Street Bangkal, Makati, Metro Manila, Philippines",
        description: "KDA: " + kdaRatingStr + " (" + dotaMatch.kills + "/" + dotaMatch.deaths + "/" + dotaMatch.assists + ")",
        start: {
            dateTime: time_1.momentToISOString(startTime),
            timeZone: 'Asia/Manila'
        },
        end: {
            dateTime: time_1.momentToISOString(endTime),
            timeZone: 'Asia/Manila'
        }
    };
}
exports.dotaMatchToCalendarEvent = dotaMatchToCalendarEvent;
function getTeam(playerSlot) {
    if (playerSlot <= 127)
        return 'radiant';
    return 'dire';
}
exports.getTeam = getTeam;
function getHeroName(heroID) {
    var hero = heroes_1["default"].find(function (hero) { return hero.id === heroID; });
    if (hero)
        return hero.localized_name;
    return String(heroID);
}
exports.getHeroName = getHeroName;
//# sourceMappingURL=dota.js.map