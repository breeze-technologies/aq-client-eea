export interface EeaUtdEntry {
    network_countrycode: string;
    network_localid: string;
    network_name: string;
    network_namespace: string;
    network_timezone: string;
    pollutant: string;
    samplingpoint_localid: string;
    samplingpoint_namespace: string;
    samplingpoint_x: string;
    samplingpoint_y: string;
    coordsys: string;
    station_code: string;
    station_localid: string;
    station_name: string;
    station_namespace: string;
    value_datetime_begin: string;
    value_datetime_end: string;
    value_datetime_inserted: string;
    value_datetime_updated: string;
    value_numeric: string;
    value_validity: string;
    value_verification: string;
    station_altitude: string;
    value_unit: string;
}
