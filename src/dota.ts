import { Observable, from } from 'rxjs';
import { map, mergeMap, concatMap, toArray } from 'rxjs/operators';
import { DotaMatch, MinimalDotaMatch } from './interfaces/dota';
import { RxHR } from '@akanass/rx-http-request';

function mapToDotaMatches(array: DotaMatch[]): DotaMatch[] {
    return array;
}

function getRelevantDetails(match: DotaMatch): MinimalDotaMatch {
    return {
        match_id: match.match_id,
        start_time: match.start_time,
        duration: match.duration
    }
}

export function fetchRecentMatches(): Observable<MinimalDotaMatch[]> {

    const account_id = process.env.ACCOUNT_ID || '102817660';

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