import { Station } from "../models/station";

export interface ClientInterface<FetcherConfig> {
    fetchLatestData: (config: FetcherConfig) => Promise<Station[]>;
}
