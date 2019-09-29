import { EEA_BASE_URL_UTD } from "../constants";
import { EeaUtdEntry } from "../models/eeaUtdEntry";
import { EeaUtdFetcherConfig } from "../models/eeaUtdFetcherConfig";
import { Station } from "../models/station";
import { convertCsvStringToJsonArray } from "../utils/csv";
import { downloadDataToBuffer } from "../utils/download";
import { convertEeaUtdToStation, indicatorToPollutantCode, isValidEeaUtdEntry } from "../utils/eeaUtdHelper";
import { convertIsoBufferToUtf8String } from "../utils/stringEncoder";

export async function fetchLatestData(fetcherConfig: EeaUtdFetcherConfig): Promise<Station[]> {
    const countryCode = fetcherConfig.countryCode;
    const pollutantCode = indicatorToPollutantCode(fetcherConfig.pollutantCode);
    const configString = `${countryCode}_${pollutantCode}.csv`;
    const downloadUrl = EEA_BASE_URL_UTD + configString;

    const dataBuffer = await downloadDataToBuffer(downloadUrl);
    const stringData = convertIsoBufferToUtf8String(dataBuffer);
    const rawData = await convertCsvStringToJsonArray<EeaUtdEntry>(stringData);
    const validatedData = rawData.filter(isValidEeaUtdEntry);
    const convertedData = validatedData.map(convertEeaUtdToStation);

    return convertedData;
}
