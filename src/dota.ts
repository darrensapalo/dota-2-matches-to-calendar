import {from, Observable, pipe} from 'rxjs';
import {concatMap, map, toArray} from 'rxjs/operators';
import {DotaMatch, MinimalDotaMatch} from './interfaces/dota';
import {RxHR} from '@akanass/rx-http-request';
import {CalendarEvent} from './interfaces/gcal';
import heroes from './constants/heroes';
import { DateUtil } from './utils/time';

/**
 * Extracts only the minimal information from a match.
 *
 * @see DotaMatch
 * @see MinimalDotaMatch
 * @param match
 */
function mapToMinimalDotaMatches()  {
    return map<DotaMatch, MinimalDotaMatch>(match => ({
        match_id: match.match_id,
        start_time: match.start_time,
        duration: match.duration,
        assists: match.assists,
        deaths: match.deaths,
        kills: match.kills,
        player_slot: match.player_slot,
        radiant_win: match.radiant_win,
        hero_id: match.hero_id
    }));
}

/**
 * @returns an Observable stream that emits a single array of dota matches with
 *          minimal information.
 * @param dotaAccountId
 */
export function fetchRecentMatches(dotaAccountId: string): Observable<MinimalDotaMatch[]> {

    const openDotaGetRecentMatchesUrl = `https://api.opendota.com/api/players/${dotaAccountId}/recentMatches`;

    const mapToDotaMatches = pipe(
      map<any, any>(response => response.body),
      map<any, DotaMatch[]>(body => JSON.parse(body)),
      concatMap(matches => from(matches))
    )

    const requestRecentDotaMatches$ = RxHR.get<any>(openDotaGetRecentMatchesUrl);

    return requestRecentDotaMatches$
        .pipe(
            mapToDotaMatches,
            mapToMinimalDotaMatches(),
            toArray()
        )
}


export function dotaMatchToCalendarEvent(dotaMatch: MinimalDotaMatch): CalendarEvent {
    const heroID = dotaMatch.hero_id;
    const heroName = getHeroName(heroID);

    const playerIsRadiant = getTeam(dotaMatch.player_slot) == 'radiant';
    const playerIsDire = getTeam(dotaMatch.player_slot) == 'dire';

    const didPlayerWin = (
      dotaMatch.radiant_win && playerIsRadiant ||
      dotaMatch.radiant_win === false && playerIsDire
    );

    const winLabel = didPlayerWin ? 'W' : 'L';

    const startTime = DateUtil.parseUnixTime(dotaMatch.start_time);
    const duration = dotaMatch.duration;
    const endTime = DateUtil.parseUnixTime(dotaMatch.start_time).add(duration, 's');

    let kdaRating = dotaMatch.kills + dotaMatch.deaths;
    if (dotaMatch.assists != 0) {
        kdaRating = kdaRating / dotaMatch.assists;
    }

    const kdaRatingStr = `${kdaRating.toFixed(2)}`

    return {
        summary: `DotA 2 (${winLabel}) - ${heroName}`,
        location: `Heneral M. Capinpin Street Bangkal, Makati, Metro Manila, Philippines`,
        description: `KDA: ${kdaRatingStr} (${dotaMatch.kills}/${dotaMatch.deaths}/${dotaMatch.assists})`,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Asia/Manila'
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Asia/Manila'
        }
    }
}

export function getTeam(playerSlot: number): ('radiant' | 'dire') {
    if (playerSlot <= 127) return 'radiant';
    return 'dire';
}

export function getHeroName(heroID: number): string {
    const hero = heroes.find(hero => hero.id === heroID);

    if (hero)
        return hero.localized_name;

    return String(heroID);
}
