import { AddressSearchResponse } from './types/GeocodingApi';
import fetch from 'node-fetch';

// see https://www.npmjs.com/package/dotenv
require('dotenv').config();


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
    throw new Error('Not implemented');
}