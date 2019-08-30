"use strict";
exports.__esModule = true;
var moment = require("moment");
function stringToMoment(datetime) {
    return moment(datetime);
}
exports.stringToMoment = stringToMoment;
function momentToISOString(moment) {
    return moment.utc().format();
}
exports.momentToISOString = momentToISOString;
function numberToMoment(unix) {
    return moment.unix(unix);
}
exports.numberToMoment = numberToMoment;
//# sourceMappingURL=time.js.map