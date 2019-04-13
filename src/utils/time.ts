import * as moment from 'moment';

export function stringToMoment(datetime: string): moment.Moment {
    return moment(datetime);
}

export function momentToISOString(moment: moment.Moment): string {
    return moment.utc().format();
}

export function numberToMoment(unix: number): moment.Moment {
    return moment.unix(unix);
}