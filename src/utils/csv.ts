import csv from "csvtojson";
import { CSVParseParam } from "csvtojson/v2/Parameters";

const csvToJsonOptions: CSVParseParam = { nullObject: true } as CSVParseParam;

export async function convertCsvStringToJsonArray<T>(csvString: string): Promise<T[]> {
    return await csv(csvToJsonOptions).fromString(csvString);
}
