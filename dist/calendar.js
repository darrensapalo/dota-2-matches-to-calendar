import { getAuthorizedClient } from "./utils/gcal";
import { google } from 'googleapis';
import { Observable, pipe, from, combineLatest, of } from "rxjs";
import { map, flatMap, filter, shareReplay, tap, toArray } from "rxjs/operators";
import { dotaMatchToCalendarEvent } from "./dota";
import * as moment from "moment";
import { momentToISOString, numberToMoment } from "./utils/time";
var authorizedClient = getAuthorizedClient().pipe(shareReplay(1));
function accessCalendar(func, query) {
    return function (subscriber) {
        func(query, function (err, res) {
            if (err) {
                subscriber.error(err);
                return;
            }
            subscriber.next(res);
            subscriber.complete();
        });
    };
}
function listEvents(auth, query) {
    var calendar = google.calendar({ version: 'v3', auth: auth });
    return new Observable(accessCalendar(calendar.events.list, query))
        .pipe(map(function (response) { return response.data.items; }));
}
export function getCalendars(auth) {
    var calendar = google.calendar({ version: 'v3', auth: auth });
    var query = {};
    return new Observable(accessCalendar(calendar.calendarList.list, query))
        .pipe(map(function (response) { return response.data.items; }));
}
export function insertCalendarEvent(auth, calendarEvent, calendarID) {
    var calendar = google.calendar({ version: 'v3', auth: auth });
    var requestBody = calendarEvent;
    var query = {
        auth: auth,
        calendarId: calendarID,
        resource: requestBody
    };
    return new Observable(accessCalendar(calendar.events.insert, query))
        .pipe(map(function (response) { return response.data; }));
}
function calendarEventExists(proposedEvent, existingEvents) {
    var foundEvent = existingEvents.find(function (existingEvent) {
        var sameStartTime = moment(existingEvent.start.dateTime).isSame(moment(proposedEvent.start.dateTime));
        var sameEndTime = moment(existingEvent.end.dateTime).isSame(moment(proposedEvent.end.dateTime));
        return sameStartTime && sameEndTime;
    });
    var eventExists = Boolean(foundEvent);
    return eventExists;
}
function getLatestCalendarEvents(daysSince) {
    var query = {
        singleEvents: true,
        maxResults: 250,
        timeMin: momentToISOString(moment().subtract(daysSince, 'd')),
        timeMax: momentToISOString(moment()),
        calendarId: process.env.CALENDAR_ID || '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com'
    };
    return getAuthorizedClient().pipe(flatMap(function (oauth) { return listEvents(oauth, query); }));
}
function daysSinceTheOldestMatch(dotaMatches) {
    var today = moment();
    var startTimes = dotaMatches.map(function (m) { return m.start_time; }).map(numberToMoment);
    var oldest = moment.min(startTimes);
    return Math.abs(oldest.diff(today, 'd') - 30);
}
function getLatestCalendarEventsSinceRecentGames(games) {
    return of(daysSinceTheOldestMatch(games))
        .pipe(flatMap(getLatestCalendarEvents));
}
export function insertNewDotaMatchesAsCalendarEvents(calendarID) {
    calendarID = calendarID || '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com';
    return pipe(flatMap(function (games) {
        return getLatestCalendarEventsSinceRecentGames(games)
            .pipe(flatMap(function (latestCalendarEvents) {
            return from(games).pipe(map(dotaMatchToCalendarEvent), map(function (proposedCalendarEvent) { return ({ proposedCalendarEvent: proposedCalendarEvent, latestCalendarEvents: latestCalendarEvents }); }));
        }));
    }), filter(function (_a) {
        var proposedCalendarEvent = _a.proposedCalendarEvent, latestCalendarEvents = _a.latestCalendarEvents;
        return calendarEventExists(proposedCalendarEvent, latestCalendarEvents) === false;
    }), map(function (_a) {
        var proposedCalendarEvent = _a.proposedCalendarEvent, latestCalendarEvents = _a.latestCalendarEvents;
        return proposedCalendarEvent;
    }), tap(function (data) { return console.log("Found an entry to insert! " + data.summary); }), flatMap(function (newCalendarEvent) {
        return combineLatest(authorizedClient, of(newCalendarEvent));
    }), flatMap(function (data) { return insertCalendarEvent(data[0], data[1], calendarID); }), toArray());
}
//# sourceMappingURL=calendar.js.map