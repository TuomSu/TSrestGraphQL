/**
 * "The response contains an array called features."
 *
 * https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/#response-fields
 */
export interface AddressSearchResponse {
    features: Feature[];
}


/**
 * "Each feature has a point geometry and properties."
 *
 * https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/#response-fields
 */
export interface Feature {
    geometry: {
        /** Coordinate position in the order: [lon, lat] */
        coordinates: [number, number];
    };

    properties: {
        id: string;

        /** "A short description of the location, for example a business name..." */
        name: string;

        /** "An estimation of how accurately this result matches the query. Value 1 means perfect match." */
        confidence: number;

        /** "If the object is originally an area or a line like a road, then the centroid is calculated" */
        accuracy: string;

        /** "Social communities, neighbourhoods, for example Itä-Pasila" */
        neighbourhood: string;

        /** "A human-friendly representation of the place with the most complete details." */
        label: string;
    };
}
