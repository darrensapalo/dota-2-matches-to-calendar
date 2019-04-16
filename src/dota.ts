import { Observable, from } from 'rxjs';
import { map, concatMap, toArray, take, tap } from 'rxjs/operators';
import { DotaMatch, MinimalDotaMatch } from './interfaces/dota';
import { RxHR } from '@akanass/rx-http-request';
import { CalendarEvent } from './interfaces/gcal';
import { numberToMoment, momentToISOString } from './utils/time';
import heroes from './constants/heroes';

function mapToDotaMatches(array: DotaMatch[]): DotaMatch[] {
    return array;
}

function getRelevantDetails(match: DotaMatch): MinimalDotaMatch {
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
    }
}

export function fetchRecentMatches(user_account_id?: number): Observable<MinimalDotaMatch[]> {

    const account_id = process.env.ACCOUNT_ID || user_account_id || '102817660';

    const URI = `https://api.opendota.com/api/players/${account_id}/recentMatches`;

    return RxHR.get(URI)
        .pipe(
            map(response => response.body),
            map(body => JSON.parse(body)),
            map(mapToDotaMatches),
            concatMap(matches => from(matches)),
            map(getRelevantDetails),
            toArray()
        )
        
}

 
export function dotaMatchToCalendarEvent(dotaMatch: DotaMatch): CalendarEvent {
    const heroID = dotaMatch.hero_id;
    const heroName = getHeroName(heroID);
    
    const isWin = dotaMatch.radiant_win && getTeam(dotaMatch.player_slot) == 'radiant';
    const winLabel = isWin ? 'W' : 'L';

    const startTime = numberToMoment(dotaMatch.start_time);
    const duration = dotaMatch.duration;
    const endTime = numberToMoment(dotaMatch.start_time).add(duration, 's');

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
            dateTime: momentToISOString(startTime),
            timeZone: 'Asia/Manila'
        },
        end: {
            dateTime: momentToISOString(endTime),
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