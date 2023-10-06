export type Mode = 'AIRPLANE' | 'BICYCLE' | 'BUS' | 'CABLE_CAR' | 'CAR' | 'FERRY' | 'FUNICULAR' | 'GONDOLA' | 'LEG_SWITCH' | 'RAIL' | 'SUBWAY' | 'TRAM' | 'TRANSIT' | 'WALK';

/**
 * The API returns a JSON object, where the actual route plan is located
 * under `data` attribute.
 */
export type RoutingResponse = {
    data: {
        plan: Plan;
    }
}

/**
 * "Plans an itinerary from point A to point B based on the given arguments"
 *
 * https://api.digitransit.fi/graphiql/hsl
 */
export type Plan = {
    itineraries: Itinerary[];
}

/**
 * "A combination of different transportation modes at certain times to reach
 * from origin to destination. For example, walking to a bus stop, taking a
 * bus for two stops and then walking to the final destination."
 *
 * https://digitransit.fi/en/developers/apis/1-routing-api/itinerary-planning/
 */
export type Itinerary = {
    /** "Time when the user leaves from the origin. Format: Unix timestamp in milliseconds." */
    startTime: number;

    /** "Time when the user arrives to the destination.. Format: Unix timestamp in milliseconds." */
    endTime: number;

    /** "How much time is spent walking, in seconds." */
    walkTime: number;

    /** "How far the user has to walk, in meters." */
    walkDistance: number;

    /**
     * "A list of Legs. Each Leg is either a walking (cycling, car) portion of the itinerary,
     * or a transit leg on a particular vehicle. So a itinerary where the user walks to the
     * Q train, transfers to the 6, then walks to their destination, has four legs."
     */
    legs: Leg[];
}

/**
 * "One part of an itinerary, e.g. walking to a bus stop or a bus ride between two stops."
 *
 * https://digitransit.fi/en/developers/apis/1-routing-api/itinerary-planning/
 */
export type Leg = {
    from: Place;
    to: Place;

    /** "The date and time when this leg begins. Format: Unix timestamp in milliseconds." */
    startTime: number;

    /** "The date and time when this leg ends. Format: Unix timestamp in milliseconds." */
    endTime: number;

    /** "Transport mode of this route, e.g. BUS" */
    mode: Mode;

    /** "The leg's duration in seconds" */
    duration: number;

    /** "How far the user has to walk, in meters." */
    distance: number;

    /** "For transit legs, the route that is used for traversing the leg. For non-transit legs, null." */
    route?: {
        /** "Short name of the route, usually a line number, e.g. 550" */
        shortName: string;

        /** "Long name of the route, e.g. Helsinki-Leppävaara" */
        longName: string;
    }
}

export type Place = {
    /** "For transit stops, the name of the stop. For points of interest, the name of the POI." */
    name?: string;

    lat: number;
    lon: number;
}
