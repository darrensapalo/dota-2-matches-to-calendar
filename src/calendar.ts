import { getAuthorizedClient } from "./utils/gcal";
import { OAuth, ListEventQuery, Calendar, CalendarEvent } from "./interfaces/gcal";
import { google } from 'googleapis';
import { Observable, Subscriber, pipe, from, empty, combineLatest, of } from "rxjs";
import { map, flatMap, filter, shareReplay, tap, toArray } from "rxjs/operators";
import { DotaMatch } from "./interfaces/dota";
import { dotaMatchToCalendarEvent } from "./dota";
import moment = require("moment");
import { momentToISOString, numberToMoment } from "./utils/time";

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
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth: OAuth, query: ListEventQuery): Observable<CalendarEvent[]> {
 
    const calendar = google.calendar({ version: 'v3', auth });

    return new Observable<any>(accessCalendar(calendar.events.list, query))
        .pipe(
            map(response => response.data.items)
        );
}

export function getCalendars(auth: OAuth): Observable<Calendar[]> {

    const calendar = google.calendar({ version: 'v3', auth });

    const query = {};

    return new Observable<any>(accessCalendar(calendar.calendarList.list, query))
        .pipe(
            map(response => response.data.items)
        );
}

export function insertCalendarEvent(auth: OAuth, calendarEvent: CalendarEvent, calendarID: string): Observable<CalendarEvent> {

    const calendar = google.calendar({ version: 'v3', auth });

    const requestBody = calendarEvent;

    const query = {
        auth: auth,
        calendarId: calendarID,
        resource: requestBody
    };

    return new Observable<any>(accessCalendar(calendar.events.insert, query))
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
        maxResults: 150,
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

    return Math.abs(oldest.diff(today, 'd') - 5);
}

/**
 * Input: a list of recent dota matches.
 * Output: Each calendar event that was inserted into the google calendar.
 */
export function insertNewDotaMatchesAsCalendarEvents(calendarID?: string) {

    calendarID = calendarID || '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com';

    return pipe(
        // Process each match one at a time
        flatMap((games: DotaMatch[]) => 

            // Pair together the latest of two streams:
            combineLatest(
                // The DotA games that were mapped into calendar events
                from(games).pipe(map(dotaMatchToCalendarEvent)),

                // And the latest calendar events based on how many days since the oldest match
                of(daysSinceTheOldestMatch(games)).pipe(flatMap(getLatestCalendarEvents))
            )),
        // Only get the ones which do not exist yet
        filter(data => calendarEventExists(data[0], data[1]) === false),
        // Go back to the proposed calendar event
        map(data => data[0]),
        tap(data => console.log("Found an entry to insert! " + data.summary)),
        // Pair together the proposed event and the Oauth client to be used with googleapis.
        flatMap(newCalendarEvent => 
            combineLatest(
                authorizedClient, 
                of(newCalendarEvent))
                ),
        // Insert the proposed calendar event
        flatMap(data => insertCalendarEvent(data[0], data[1], calendarID)),
        toArray()
    )
}