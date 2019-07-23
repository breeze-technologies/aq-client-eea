import moment from "moment";
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
                dateStart: moment(entry.value_datetime_begin),
                dateEnd: moment(entry.value_datetime_end),
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
                return true;
            }
            return false;
        }).length === 0;
    if (!fieldsSufficientlyDefined) {
        return false;
    }

    const startDate = moment(entry.value_datetime_begin);
    const endDate = moment(entry.value_datetime_end);
    if (!startDate.isValid() || !endDate.isValid()) {
        return false;
    }

    if (endDate.isSameOrBefore(startDate)) {
        return false;
    }

    if (!isNumber(entry.value_numeric) || entry.value_numeric < 0) {
        return false;
    }

    if (entry.value_unit !== "ug_m3") {
        return false;
    }

    if (entry.coordsys !== "ESPG:4979") {
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
