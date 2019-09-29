import moment from "moment";

export function convertStringToDateWithTimezone(dateString: string, timezoneOffset: string): Date | null {
    const date = moment.parseZone(dateString);
    date.utcOffset(timezoneOffset);

    if (!date.isValid()) {
        return null;
    }

    return date.toDate();
}

export function isDateSameOrBefore(date1: Date, date2: Date) {
    return moment(date1).isSameOrBefore(date2);
}
