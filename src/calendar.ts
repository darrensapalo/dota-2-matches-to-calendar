import {getAuthorizedClient} from "./utils/gcal";
import {Calendar, CalendarEvent, ListEventQuery} from "./interfaces/gcal";
import {google} from 'googleapis';
import {combineLatest, from, Observable, of, pipe, Subscriber} from "rxjs";
import {
    filter,
    flatMap,
    map,
    mergeMap,
    shareReplay,
    tap,
    toArray
} from "rxjs/operators";
import {DotaMatch} from "./interfaces/dota";
import {dotaMatchToCalendarEvent} from "./dota";
import * as moment from "moment";
import {momentToISOString, numberToMoment} from "./utils/time";
import {OAuth2Client} from "googleapis-common";

// getAuthorizedClient()
//     .pipe(
//         concatMap(insertCalendarEvent),
//     )
//     .subscribe(console.log, console.error);

let authorizedClient = getAuthorizedClient().pipe(shareReplay(1));

function accessCalendar<T>(func: Function, query: any): (subscriber: Subscriber<T>) => void {
    return subscriber => {

        func(query, (err, res) => {
            if (err) {
                subscriber.error(err);
                return;
            }

            subscriber.next(res);
            subscriber.complete();
        });

    }
}


/**
 * Lists the last 10 events since three days ago.
 * @param {OAuth2Client} auth An authorized OAuth2 client.
 */
function listEvents(auth: OAuth2Client, query: ListEventQuery): Observable<CalendarEvent[]> {

    const calendar = google.calendar({ version: 'v3', auth });

    return new Observable<any>(accessCalendar(calendar.events.list.bind(calendar.events), query))
        .pipe(
            map(response => response.data.items)
        );
}

export function getCalendars(auth: OAuth2Client): Observable<Calendar[]> {

    const calendar = google.calendar({ version: 'v3', auth });

    const query = {};

    return new Observable<any>(accessCalendar(calendar.calendarList.list.bind(calendar.events), query))
        .pipe(
            map(response => response.data.items)
        );
}

export function insertCalendarEvent(auth: OAuth2Client, calendarEvent: CalendarEvent, calendarID: string): Observable<CalendarEvent> {

    const calendar = google.calendar({ version: 'v3', auth });

    const requestBody = calendarEvent;

    const query = {
        auth: auth,
        calendarId: calendarID,
        resource: requestBody
    };

    return new Observable<any>(accessCalendar(calendar.events.insert.bind(calendar.events), query))
        .pipe(
            map(response => response.data)
        );
}

function calendarEventExists(proposedEvent: CalendarEvent, existingEvents: CalendarEvent[]): boolean {

    const foundEvent = existingEvents.find((existingEvent: CalendarEvent) => {

        const sameStartTime = moment(existingEvent.start.dateTime).isSame(moment(proposedEvent.start.dateTime));
        const sameEndTime = moment(existingEvent.end.dateTime).isSame(moment(proposedEvent.end.dateTime));

        return sameStartTime && sameEndTime;
    })

    const eventExists = Boolean(foundEvent);

    return eventExists;
}


function getLatestCalendarEvents(daysSince: number): Observable<CalendarEvent[]> {

    const query : ListEventQuery = {
        singleEvents: true,
        maxResults: 250,
        timeMin: momentToISOString(moment().subtract(daysSince, 'd')),
        timeMax: momentToISOString(moment()),
        calendarId: process.env.CALENDAR_ID || '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com'
    }

    return getAuthorizedClient().pipe(
        flatMap(oauth => listEvents(oauth, query))
    );
}

function daysSinceTheOldestMatch(dotaMatches: DotaMatch[]): number {
    const today = moment();

    const startTimes = dotaMatches.map(m => m.start_time).map(numberToMoment);

    const oldest = moment.min(startTimes);

    return Math.abs(oldest.diff(today, 'd') - 30);
}

function getLatestCalendarEventsSinceRecentGames(games: DotaMatch[]) {
    return of(daysSinceTheOldestMatch(games))
    .pipe(
        flatMap(getLatestCalendarEvents)
    )
}

/**
 * Input: a list of recent dota matches.
 * Output: Each calendar event that was inserted into the google calendar.
 */
export function insertNewDotaMatchesAsCalendarEvents(calendarID?: string) {

    calendarID = calendarID || '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com';

    return pipe(
        // Process each match one at a time
        mergeMap((games: DotaMatch[]) =>

            // And the latest calendar events based on how many days since the oldest match
            getLatestCalendarEventsSinceRecentGames(games)
            .pipe(
                mergeMap(latestCalendarEvents =>
                    from(games).pipe(
                        // The DotA games that were mapped into calendar events
                        map(dotaMatchToCalendarEvent),

                        // Pair together the latest of two streams:
                        map(proposedCalendarEvent => ({ proposedCalendarEvent, latestCalendarEvents }))
                    )),
            )
        ),
        // Only get the ones which do not exist yet
        filter(({proposedCalendarEvent, latestCalendarEvents}) =>
            calendarEventExists(proposedCalendarEvent, latestCalendarEvents) === false),
        // Go back to the proposed calendar event
        map(({proposedCalendarEvent, latestCalendarEvents}) => proposedCalendarEvent),
        tap(data => console.log("Found an entry to insert! " + data.summary)),
        // Pair together the proposed event and the Oauth client to be used with googleapis.
        mergeMap(newCalendarEvent =>
            combineLatest(
                authorizedClient,
                of(newCalendarEvent))
                ),
        // Insert the proposed calendar event
        mergeMap(data => insertCalendarEvent(data[0], data[1], calendarID)),
        toArray()
    )
}
