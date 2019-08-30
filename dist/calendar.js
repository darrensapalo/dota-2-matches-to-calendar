"use strict";
exports.__esModule = true;
var gcal_1 = require("./utils/gcal");
var googleapis_1 = require("googleapis");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var dota_1 = require("./dota");
var moment = require("moment");
var time_1 = require("./utils/time");
var authorizedClient = gcal_1.getAuthorizedClient().pipe(operators_1.shareReplay(1));
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
    var calendar = googleapis_1.google.calendar({ version: 'v3', auth: auth });
    return new rxjs_1.Observable(accessCalendar(calendar.events.list.bind(calendar.events), query))
        .pipe(operators_1.map(function (response) { return response.data.items; }));
}
function getCalendars(auth) {
    var calendar = googleapis_1.google.calendar({ version: 'v3', auth: auth });
    var query = {};
    return new rxjs_1.Observable(accessCalendar(calendar.calendarList.list.bind(calendar.events), query))
        .pipe(operators_1.map(function (response) { return response.data.items; }));
}
exports.getCalendars = getCalendars;
function insertCalendarEvent(auth, calendarEvent, calendarID) {
    var calendar = googleapis_1.google.calendar({ version: 'v3', auth: auth });
    var requestBody = calendarEvent;
    var query = {
        auth: auth,
        calendarId: calendarID,
        resource: requestBody
    };
    return new rxjs_1.Observable(accessCalendar(calendar.events.insert.bind(calendar.events), query))
        .pipe(operators_1.map(function (response) { return response.data; }));
}
exports.insertCalendarEvent = insertCalendarEvent;
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
        timeMin: time_1.momentToISOString(moment().subtract(daysSince, 'd')),
        timeMax: time_1.momentToISOString(moment()),
        calendarId: process.env.CALENDAR_ID || '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com'
    };
    return gcal_1.getAuthorizedClient().pipe(operators_1.flatMap(function (oauth) { return listEvents(oauth, query); }));
}
function daysSinceTheOldestMatch(dotaMatches) {
    var today = moment();
    var startTimes = dotaMatches.map(function (m) { return m.start_time; }).map(time_1.numberToMoment);
    var oldest = moment.min(startTimes);
    return Math.abs(oldest.diff(today, 'd') - 30);
}
function getLatestCalendarEventsSinceRecentGames(games) {
    return rxjs_1.of(daysSinceTheOldestMatch(games))
        .pipe(operators_1.flatMap(getLatestCalendarEvents));
}
function insertNewDotaMatchesAsCalendarEvents(calendarID) {
    calendarID = calendarID || '6c7uqlv2f3kvbvqjjge18d35c8@group.calendar.google.com';
    return rxjs_1.pipe(operators_1.flatMap(function (games) {
        return getLatestCalendarEventsSinceRecentGames(games)
            .pipe(operators_1.flatMap(function (latestCalendarEvents) {
            return rxjs_1.from(games).pipe(operators_1.map(dota_1.dotaMatchToCalendarEvent), operators_1.map(function (proposedCalendarEvent) { return ({ proposedCalendarEvent: proposedCalendarEvent, latestCalendarEvents: latestCalendarEvents }); }));
        }));
    }), operators_1.filter(function (_a) {
        var proposedCalendarEvent = _a.proposedCalendarEvent, latestCalendarEvents = _a.latestCalendarEvents;
        return calendarEventExists(proposedCalendarEvent, latestCalendarEvents) === false;
    }), operators_1.map(function (_a) {
        var proposedCalendarEvent = _a.proposedCalendarEvent, latestCalendarEvents = _a.latestCalendarEvents;
        return proposedCalendarEvent;
    }), operators_1.tap(function (data) { return console.log("Found an entry to insert! " + data.summary); }), operators_1.flatMap(function (newCalendarEvent) {
        return rxjs_1.combineLatest(authorizedClient, rxjs_1.of(newCalendarEvent));
    }), operators_1.flatMap(function (data) { return insertCalendarEvent(data[0], data[1], calendarID); }), operators_1.toArray());
}
exports.insertNewDotaMatchesAsCalendarEvents = insertNewDotaMatchesAsCalendarEvents;
//# sourceMappingURL=calendar.js.map