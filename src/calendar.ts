import { getAuthorizedClient } from "./utils/gcal";
import { OAuth, ListEventQuery, Calendar, CalendarEvent } from "./interfaces/gcal";
import { google } from 'googleapis';
import { Observable, Subscriber, pipe, from, empty, combineLatest, of } from "rxjs";
import { concatMap, map, flatMap, filter, shareReplay } from "rxjs/operators";
import { DotaMatch } from "./interfaces/dota";

// getAuthorizedClient()
//     .pipe(
//         concatMap(insertCalendarEvent),
//     )
//     .subscribe(console.log, console.error);

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
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth: OAuth, listEventQuery: ListEventQuery): Observable<CalendarEvent[]> {

    const query = {
        calendarId: listEventQuery.calendarId       || '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com',
        timeMin: listEventQuery.timeMin             || (new Date()).toISOString(),
        maxResults: listEventQuery.maxResults       || 20,
        singleEvents: listEventQuery.singleEvents   || true,
        orderBy: listEventQuery.orderBy             || 'startTime',
    }

    const calendar = google.calendar({ version: 'v3', auth });

    return new Observable<any>(accessCalendar(calendar.events.list, query))
        .pipe(
            map(response => response.data.items)
        );
}

function getCalendars(auth: OAuth): Observable<Calendar[]> {

    const calendar = google.calendar({ version: 'v3', auth });

    const query = {};

    return new Observable<Calendar[]>(accessCalendar(calendar.calendarList.list, query));
}

function insertCalendarEvent(auth: OAuth, calendarEvent: CalendarEvent): Observable<CalendarEvent> {

    const calendar = google.calendar({ version: 'v3', auth });

    const requestBody = {
        "end": {
            "dateTime": "2019-04-12T15:09:28.000Z"
        },
        "start": {
            "dateTime": "2019-04-12T15:07:28.000Z"
        },
        "summary": "EVENT_NAME"
    };

    const query = {
        calendarId: '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com',
        resource: requestBody
    };

    return new Observable<CalendarEvent>(accessCalendar(calendar.events.insert, query));
}

function calendarEventExists(proposedEvent: CalendarEvent, existingEvents: CalendarEvent[]): boolean {
    return true;
}

function dotaMatchToCalendarEvent(dotaMatch: DotaMatch): CalendarEvent {
    return {

    }
}

function getLatestCalendarEvents(): Observable<CalendarEvent[]> {
    return empty();
}

/**
 * Input: a list of recent dota matches.
 * Output: Each calendar event that was inserted into the google calendar.
 */
function insertNewDotaMatchesAsCalendarEvents() {

    let calendarEvents = getLatestCalendarEvents().pipe(shareReplay(1))

    let authorizedClient =  getAuthorizedClient().pipe(shareReplay(1))

    return pipe(
        // Process each match one at a time
        flatMap((games: DotaMatch[]) => from(games)),
        // Transform the match into a proposed CalendarEvent
        map(dotaMatchToCalendarEvent),
        // Pair together the proposed event and the list of current calendar events
        flatMap((proposedEvent: CalendarEvent) => 
            combineLatest(
                of(proposedEvent), 
                calendarEvents)
                ),
        // Only get the ones which do not exist yet
        filter(data => calendarEventExists(data[0], data[1]) == false),
        // Go back to the proposed calendar event
        map(data => data[0]),
        // Pair together the proposed event and the Oauth client to be used with googleapis.
        flatMap(newCalendarEvent => 
            combineLatest(
                authorizedClient, 
                of(newCalendarEvent))
                ),
        // Insert the proposed calendar event
        flatMap(data => insertCalendarEvent(data[0], data[1]))
    )
}