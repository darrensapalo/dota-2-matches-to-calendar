import dayjs from "dayjs";
import { google } from 'googleapis';
import { OAuth2Client } from "googleapis-common";
import { combineLatest, from, Observable, of, pipe, Subscriber } from "rxjs";
import {
    filter,
    flatMap,
    map,
    mergeMap,
    shareReplay,
    take,
    tap,
    toArray
} from "rxjs/operators";
import { dotaMatchToCalendarEvent } from "./dota";
import { DotaMatch, MinimalDotaMatch } from "./interfaces/dota";
import { Calendar, CalendarEvent, ListEventQuery } from "./interfaces/gcal";
import { GoogleCalendarAuth } from "./utils/gcal";
import { DateUtil } from "./utils/time";

function accessCalendar<T>(func: Function, query: any): (subscriber: Subscriber<T>) => void {
    return subscriber => {

        func(query, (err: any, res: any) => {
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

        const sameStartTime = dayjs(existingEvent?.start?.dateTime).isSame(dayjs(proposedEvent?.start?.dateTime));
        const sameEndTime = dayjs(existingEvent?.end?.dateTime).isSame(dayjs(proposedEvent?.end?.dateTime));

        return sameStartTime && sameEndTime;
    })

    const eventExists = Boolean(foundEvent);

    return eventExists;
}


function getLatestCalendarEvents(gcalAuth: GoogleCalendarAuth, daysSince: number): Observable<CalendarEvent[]> {

    const query : ListEventQuery = {
        singleEvents: true,
        maxResults: 250,
        timeMin: DateUtil.parseDate(dayjs().subtract(daysSince, 'd').toISOString()).toISOString(),
        timeMax: dayjs().toISOString(),
        calendarId: process.env.DEFAULT_CALENDAR_ID,
    }

    return gcalAuth.getAuthorizedClient().pipe(
        flatMap(oauth => listEvents(oauth, query))
    );
}

function daysSinceTheOldestMatch(dotaMatches: MinimalDotaMatch[]): number {
    const today = dayjs();

    const startTimes = dotaMatches.map(m => m.start_time).map(DateUtil.parseUnixTime);

    const oldest = startTimes.reduce((acc, curr) => {
        if (curr.isBefore(acc)) {
            return curr;
        }
        return acc;
    }, dayjs());

    return Math.abs(oldest.diff(today, 'd') - 30);
}

function getLatestCalendarEventsSinceRecentGames(
    gcalAuth: GoogleCalendarAuth,
    games: MinimalDotaMatch[],
) {
    return of(daysSinceTheOldestMatch(games))
    .pipe(
        mergeMap((daysSince) => getLatestCalendarEvents(gcalAuth, daysSince))
    )
}

/**
 * Input: a list of recent dota matches.
 * Output: Each calendar event that was inserted into the google calendar.
 */
export function insertNewDotaMatchesAsCalendarEvents(gcalAuth: GoogleCalendarAuth) {

    return pipe(
        // Process each match one at a time
        mergeMap((games: MinimalDotaMatch[]) =>

            // And the latest calendar events based on how many days since the oldest match
            getLatestCalendarEventsSinceRecentGames(gcalAuth, games)
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
        tap(data => console.log("Found an entry to insert:", JSON.stringify(data, null, 2))),
        // Pair together the proposed event and the Oauth client to be used with googleapis.
        mergeMap(newCalendarEvent =>
            combineLatest(
                gcalAuth.getAuthorizedClient(),
                of(newCalendarEvent))
                ),
        // Insert the proposed calendar event
        mergeMap(data => insertCalendarEvent(data[0], data[1], gcalAuth.getCalendarID())),
        toArray()
    )
}
