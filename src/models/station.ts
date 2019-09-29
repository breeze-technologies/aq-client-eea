import { Location } from "./location";
import { Measurement } from "./measurement";
import { Source } from "./source";

export type Station = {
    id: string;
    name: string;

    source: Source;
    location: Location;
    measurements: Measurement[];

    misc?: { [key: string]: any };
};
