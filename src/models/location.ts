export interface Location {
    latitude: number;
    longitude: number;
    altitude?: number;

    countryCode: string;
    zipCode?: string;
    city?: string;
    streetName?: string;
    streetNumber?: string;
}
