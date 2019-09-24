# EEA Air Quality Client

This is a JavaScript/TypeScript client library for accessing EU air quality data. It uses the [direct download service for E2a up-to-date air quality data](http://discomap.eea.europa.eu/map/fme/AirQualityUTDExport.htm) provided by the [European Environment agency](https://www.eea.europa.eu/).

## Usage

The client loads air quality data on a per-country per-pollutant basis. Therefore, a `fetchConfig` object is required.

```javascript
import fetchLatestData from "aq-client-eea";

const fetchConfig = {countryCode: "DE", pollutantCode: "NO2"};
const stations = await fetchLatestData(fetchConfig);
```

The client prefilters for certain invalid stations or measurements and converts them into a universal JSON model.

---

Licensed under the EUPL.
