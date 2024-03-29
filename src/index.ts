import { addressSearch } from './addressSearch';
import { RoutingResponse, Itinerary, Leg, Plan, Place, Mode } from './types/RoutingApi';
import { getAddressesAndCoordinates } from './addressSearch';

async function main() {
    // make sure that the user has given additional parameters for locations
    if (process.argv.length !== 4) {
        console.error('Usage: npm start "Ratapihantie 13" "suomenlinna"');
        return;
    }

    const from = process.argv[2];
    const to = process.argv[3];

    // TODO: search geolocations for the given strings and plan an itinerary
    try {
        const itinerary = await getAddressesAndCoordinates(from, to);
        //console.log('Itinerary:', itinerary);
      } catch (error) {
        console.error('Error in main:', error);
      }
    }
    //console.log({ from, to });


main();

