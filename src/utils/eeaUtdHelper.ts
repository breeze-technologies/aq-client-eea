import {
    EEA_TIMEZONE_DEFAULT_OFFSET,
    EEA_TIMEZONE_DEFINITION_BASE_URL,
    EEA_VALID_COORDSYS,
    EEA_VALID_UNITS,
} from "../constants";
import { EeaUtdEntry } from "../models/eeaUtdEntry";
import { Station } from "../models/station";
import { convertStringToDateWithTimezone, isDateSameOrBefore } from "./date";

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
    const timezoneOffset = extractEeaTimezone(entry) || EEA_TIMEZONE_DEFAULT_OFFSET;
    const dateStart = convertStringToDateWithTimezone(entry.value_datetime_begin, timezoneOffset) as Date;
    const dateEnd = convertStringToDateWithTimezone(entry.value_datetime_end, timezoneOffset) as Date;

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

    const timezoneOffset = extractEeaTimezone(entry);
    if (!timezoneOffset) {
        return false;
    }

    const startDate = convertStringToDateWithTimezone(entry.value_datetime_begin, timezoneOffset);
    const endDate = convertStringToDateWithTimezone(entry.value_datetime_end, timezoneOffset);

    if (!startDate || !endDate) {
        return false;
    }

    if (isDateSameOrBefore(endDate, startDate)) {
        return false;
    }

    const valueNum = parseFloat(entry.value_numeric);
    if (isNaN(valueNum) || valueNum < 0) {
        return false;
    }

    if (!EEA_VALID_UNITS.find((u) => entry.value_unit === u)) {
        return false;
    }

    if (entry.coordsys !== EEA_VALID_COORDSYS) {
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

function extractEeaTimezone(entry: EeaUtdEntry): string | null {
    if (!entry.network_timezone) {
        return null;
    }

    const timezoneDefUrl = entry.network_timezone;
    const timezoneDefOffset = timezoneDefUrl.replace(EEA_TIMEZONE_DEFINITION_BASE_URL, "");

    if (
        timezoneDefOffset === "" ||
        timezoneDefOffset.length !== 3 ||
        (!timezoneDefOffset.startsWith("+") && !timezoneDefOffset.startsWith("-"))
    ) {
        return EEA_TIMEZONE_DEFAULT_OFFSET;
    }
    return timezoneDefOffset + ":00";
}
