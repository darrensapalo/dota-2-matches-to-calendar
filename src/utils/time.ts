import dayjs, { unix } from "dayjs";

export class DateUtil {

    /**
     * Parses the date in ISO 8601 format.
     * @param datetime the date in ISO 8601 format.
     * @returns a dayjs instance.
     */
    static parseDate(datetime: string): dayjs.Dayjs {
        return dayjs(datetime);
    }

    /**
     * Parses the date in unix time format (milliseconds).
     * @param unixTimeMs the datetime in unix time (ms) format
     * @returns a dayjs instance.
     */
    static parseUnixTime(unixTimeMs: number): dayjs.Dayjs {
        return dayjs(unixTimeMs);
    }

}