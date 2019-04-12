import * as moment from 'moment';

export function stringToMoment(datetime: string): moment.Moment {
    return moment(datetime);
}

export function momentToISOString(moment: moment.Moment): string {
    return moment.toISOString();
}