import { Moment } from "moment";

export interface Measurement {
    indicator: string;
    dateStart: Date | Moment;
    dateEnd: Date | Moment;
    value: number;
    unit: string;
}
