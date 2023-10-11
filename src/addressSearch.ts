import { features } from 'process';
import { AddressSearchResponse, Feature } from './types/GeocodingApi';
import { RoutingResponse } from './types/RoutingApi';
import fetch from 'node-fetch';

// see https://www.npmjs.com/package/dotenv
require('dotenv').config();
let apiKey = process.env['DIGITRANSIT_API_KEY'];

/**
 * "Address search can be used to search addresses and points of interest (POIs).
 * An address is matched to its corresponding geographic coordinates and in the
 * simplest search, you can provide only one parameter, the text you want to
 * match in any part of the location details."
 *
 * https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/
 *
 * @param text a name or an address of a place
 * @param size the maximum number of matches to fetch
 * @returns
 */
export async function addressSearch(text: string, size: number = 1): Promise<AddressSearchResponse> {
  let encodetext = encodeURIComponent(text);
    const apiUrl = `https://api.digitransit.fi/geocoding/v1/search?text=${encodetext}&size=${size}&digitransit-subscription-key=${apiKey}`;
    //tee apikutsu ja palauta koordinaatit ja lisää virheenkäsittely
    try{
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        const data: AddressSearchResponse = await response.json();
        if (data.features.length === 0){
          return{features:[]};
        }
        //const lon = data.features[0].geometry.coordinates[0];
        //const lat = data.features[0].geometry.coordinates[1];

        const limitedSize = data.features.slice(0,size);

        const coordinates: AddressSearchResponse = {
            features: limitedSize.map(feature => ({
            geometry: {
              coordinates: [
                feature.geometry.coordinates[0], //lon 
                feature.geometry.coordinates[1]] //lat
            },
            properties: {
              id: feature.properties.id,
              name: feature.properties.name,
              confidence: feature.properties.confidence,
              accuracy: feature.properties.accuracy,
              neighbourhood: feature.properties.neighbourhood,
              label: feature.properties.label,
            }
          }))
    };
    

        return coordinates;
        }
    catch (error) {
    console.error('Error in addressSearch:', error)
    throw error;
}
}


  async function routingFromTo(latFrom: number, lonFrom: number, latTo: number, lonTo: number){
    try{
  let response = await fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
    headers: { 
      'Content-Type': 'application/graphql',
      'digitransit-subscription-key':`${apiKey}` 
    },
    method: 'POST',
    body: `{ plan(
      from: {lat: ${latFrom}, lon:${lonFrom} }
      to: {lat: ${latTo}, lon:${lonTo} }
      numItineraries: 1
    ){
      itineraries {
          startTime
          endTime
          walkTime
          walkDistance
          legs {
              from {
                  name
                  lat
                  lon
              }
              to {
                  name
                  lat
                  lon
              }
              startTime
              endTime
              mode
              duration
              distance
              route {
                  shortName
                  longName
              }
          }
      }
  }
  }`
});

if (!response.ok) {
  //console.log(response);
  throw new Error(`HTTP error! Status: ${response.status}`);
}


let routing: RoutingResponse = await response.json();
//console.log(routing);

if (!routing || !routing.data) {
  throw new Error('Invalid API response format');
}


const firstItinerary = routing.data.plan.itineraries[0];
//console.log(firstItinerary);

const fromPlace = firstItinerary.legs[1].from.name;
const toPlace = firstItinerary.legs[firstItinerary.legs.length - 1].from.name;

console.log(`Route from ${fromPlace} to ${toPlace}:`);
firstItinerary.legs.forEach((leg, index) => {
  const legFrom = leg.from.name;
  const legTo = leg.to.name;
  console.log(`  From: ${legFrom}`);
  console.log(`  To: ${legTo}`);
});
  } catch (error) {
    console.error('Error in routingFromTo:', error);
  }
}

export async function getAddressesAndCoordinates(address1:string, address2:string) {

  /*const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Must include 2 addresses');
} else {
  address1 = args[0];
  address2 = args[1];*/

  const textFrom = address1; 
  const textTo = address2;

  const fromA = await addressSearch(textFrom);
  const toA = await addressSearch(textTo);

  if (fromA.features.length === 0 || toA.features.length === 0) {
    console.error('One or both addresses not found.');
    return;
  }

  const latFrom = fromA.features[0].geometry.coordinates[1];
  const lonFrom = fromA.features[0].geometry.coordinates[0];

  const latTo = toA.features[0].geometry.coordinates[1];
  const lonTo = toA.features[0].geometry.coordinates[0];
//console.log(latFrom, lonFrom, latTo, lonTo);
  routingFromTo(latFrom, lonFrom, latTo, lonTo);
}




