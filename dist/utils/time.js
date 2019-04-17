import * as moment from 'moment';
export function stringToMoment(datetime) {
    return moment(datetime);
}
export function momentToISOString(moment) {
    return moment.utc().format();
}
export function numberToMoment(unix) {
    return moment.unix(unix);
}
//# sourceMappingURL=time.js.map