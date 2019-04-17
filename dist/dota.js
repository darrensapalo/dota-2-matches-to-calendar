import { from } from 'rxjs';
import { map, concatMap, toArray } from 'rxjs/operators';
import { RxHR } from '@akanass/rx-http-request';
import { numberToMoment, momentToISOString } from './utils/time';
import heroes from './constants/heroes';
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
export function fetchRecentMatches(user_account_id) {
    var account_id = process.env.ACCOUNT_ID || user_account_id || '102817660';
    var URI = "https://api.opendota.com/api/players/" + account_id + "/recentMatches";
    return RxHR.get(URI)
        .pipe(map(function (response) { return response.body; }), map(function (body) { return JSON.parse(body); }), map(mapToDotaMatches), concatMap(function (matches) { return from(matches); }), map(getRelevantDetails), toArray());
}
export function dotaMatchToCalendarEvent(dotaMatch) {
    var heroID = dotaMatch.hero_id;
    var heroName = getHeroName(heroID);
    var isWin = dotaMatch.radiant_win && getTeam(dotaMatch.player_slot) == 'radiant';
    var winLabel = isWin ? 'W' : 'L';
    var startTime = numberToMoment(dotaMatch.start_time);
    var duration = dotaMatch.duration;
    var endTime = numberToMoment(dotaMatch.start_time).add(duration, 's');
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
            dateTime: momentToISOString(startTime),
            timeZone: 'Asia/Manila'
        },
        end: {
            dateTime: momentToISOString(endTime),
            timeZone: 'Asia/Manila'
        }
    };
}
export function getTeam(playerSlot) {
    if (playerSlot <= 127)
        return 'radiant';
    return 'dire';
}
export function getHeroName(heroID) {
    var hero = heroes.find(function (hero) { return hero.id === heroID; });
    if (hero)
        return hero.localized_name;
    return String(heroID);
}
//# sourceMappingURL=dota.js.map