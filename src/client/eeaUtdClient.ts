import csv from "csvtojson";
import { CSVParseParam } from "csvtojson/v2/Parameters";
import request from "request";
import { EeaConstants } from "../constants";
import { EeaUtdFetcherConfig } from "../models/eeaUtdFetcherConfig";
import { Station } from "../models/station";
import { convertEeaUtdToStation, isValidEeaUtdEntry } from "../utils/eeaUtdHelper";
import { ClientInterface } from "./clientInterface";

export class EeaUtdClient implements ClientInterface<EeaUtdFetcherConfig> {
    private csvToJsonOptions: CSVParseParam;
    constructor() {
        this.csvToJsonOptions = { nullObject: true } as any;
    }

    public async fetchLatestData(fetcherConfig: EeaUtdFetcherConfig): Promise<Station[]> {
        const configString = `${fetcherConfig.countryCode}_${fetcherConfig.pollutantCode}.csv`;
        const downloadUrl = EeaConstants.BASE_URL_UTD + configString;

        const stringData = await this.downloadData(downloadUrl);
        const rawData = await csv(this.csvToJsonOptions).fromString(stringData);
        const validatedData = rawData.filter((d) => isValidEeaUtdEntry(d));
        return validatedData.map(convertEeaUtdToStation);
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
