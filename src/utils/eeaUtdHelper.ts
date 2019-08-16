import moment, { Moment } from "moment";
import { isNumber } from "util";
import { EeaUtdEntry } from "../models/eeaUtdEntry";
import { Station } from "../models/station";

const validationFields = [
    "network_countrycode",
    "pollutant",
    "samplingpoint_x",
    "samplingpoint_y",
    "coordsys",
    "station_localid",
    "station_name",
    "value_datetime_begin",
    "value_datetime_end",
    "value_numeric",
    "value_unit",
];

export function convertEeaUtdToStation(entry: EeaUtdEntry): Station {
    const timezoneOffset = extractTimezone(entry) || "+00:00";
    const dateStart = adjustDateToTimezoneOffset(entry.value_datetime_begin, timezoneOffset);
    const dateEnd = adjustDateToTimezoneOffset(entry.value_datetime_end, timezoneOffset);

    return {
        id: entry.station_localid,
        name: entry.station_name,
        location: {
            latitude: parseFloat(entry.samplingpoint_y),
            longitude: parseFloat(entry.samplingpoint_x),
            countryCode: entry.network_countrycode,
        },
        measurements: [
            {
                dateStart,
                dateEnd,
                indicator: pollutantToIndicatorKey(entry.pollutant),
                value: parseFloat(entry.value_numeric),
                unit: entry.value_unit,
            },
        ],
        source: {
            name: "European Environmental Agency",
            key: "EEA_UTD",
            administrator: entry.network_name,
        },
    };
}

export function isValidEeaUtdEntry(entry: EeaUtdEntry): boolean {
    const fieldsSufficientlyDefined =
        validationFields.filter((field) => {
            const value = (entry as any)[field];
            if (value === undefined || value === null) {
                return false;
            }
            return true;
        }).length === validationFields.length;
    if (!fieldsSufficientlyDefined) {
        return false;
    }

    const timezoneOffset = extractTimezone(entry);
    if (!timezoneOffset) {
        return false;
    }

    const startDate = adjustDateToTimezoneOffset(entry.value_datetime_begin, timezoneOffset);
    const endDate = adjustDateToTimezoneOffset(entry.value_datetime_end, timezoneOffset);

    if (!startDate.isValid() || !endDate.isValid()) {
        return false;
    }

    if (endDate.isSameOrBefore(startDate)) {
        return false;
    }

    const valueNum = parseFloat(entry.value_numeric);
    if (isNaN(valueNum) || valueNum < 0) {
        return false;
    }

    if (entry.value_unit !== "ug/m3" && entry.value_unit !== "mg/m3") {
        console.log(entry.station_localid, "unit", entry.value_unit);
        return false;
    }

    if (entry.coordsys !== "EPSG:4979") {
        console.log(entry.station_localid, "coordsys", entry.coordsys);
        return false;
    }

    if (pollutantToIndicatorKey(entry.pollutant) === "") {
        return false;
    }

    return true;
}

function pollutantToIndicatorKey(pollutantKey: string) {
    switch (pollutantKey) {
        case "PM10":
            return "pm10";
        case "PM2.5":
            return "pm2.5";
        case "CO":
            return "co";
        case "SO2":
            return "so2";
        case "NO2":
            return "no2";
        case "O3":
            return "o3";
        case "NH3":
            return "nh3";
        case "NO":
            return "no";
        default:
            return "";
    }
}

function extractTimezone(entry: EeaUtdEntry): string | null {
    if (!entry.network_timezone) {
        return null;
    }

    const timezoneDefUrl = entry.network_timezone;
    const timezoneDefOffset = timezoneDefUrl.replace("http://dd.eionet.europa.eu/vocabulary/aq/timezone/UTC", "");

    if (
        timezoneDefOffset === "" ||
        timezoneDefOffset.length !== 3 ||
        (!timezoneDefOffset.startsWith("+") && !timezoneDefOffset.startsWith("-"))
    ) {
        return "+00:00";
    }
    return timezoneDefOffset + ":00";
}

function adjustDateToTimezoneOffset(dateString: string, timezoneOffset: string): Moment {
    const date = moment.parseZone(dateString);
    date.utcOffset(timezoneOffset);
    return date;
}
