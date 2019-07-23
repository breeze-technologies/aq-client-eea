import csv from "csvtojson";
import { Converter } from "csvtojson/v2/Converter";
import request from "request";
import { CONSTANTS } from "../constants";
import { EeaUtdFetcherConfig } from "../models/eeaUtdFetcherConfig";
import { Station } from "../models/station";
import { convertEeaUtdToStation, isValidEeaUtdEntry } from "../utils/eeaUtdHelper";
import { ClientInterface } from "./clientInterface";

export class EeaUtdClient implements ClientInterface<EeaUtdFetcherConfig> {
    private csvToJson: Converter;
    constructor() {
        this.csvToJson = csv({ nullObject: true });
    }

    public fetchLatestData(fetcherConfig: EeaUtdFetcherConfig): Promise<Station[]> {
        const configString = `${fetcherConfig.countryCode}_${fetcherConfig.pollutantCode}.csv`;
        const downloadUrl = CONSTANTS.BASE_URL_EEA_UTD + configString;

        return this.downloadData(downloadUrl)
            .then(this.csvToJson.fromString)
            .then((rawData) => rawData.filter(isValidEeaUtdEntry))
            .then((validatedData) => validatedData.map(convertEeaUtdToStation));
    }

    private downloadData(downloadUrl: string) {
        return new Promise<string>((resolve, reject) => {
            request(downloadUrl, async (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!response || response.statusCode !== 200) {
                    reject("Invalid response: " + downloadUrl);
                    return;
                }
                resolve(body);
            });
        });
    }
}
