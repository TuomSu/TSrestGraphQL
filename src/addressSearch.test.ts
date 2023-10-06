import { test, describe } from '@jest/globals';
import { strict as assert } from 'node:assert';
import { addressSearch } from './addressSearch';

describe('Address search', () => {

    test('Searching by exact street address returns correct properties', async () => {
        let response = await addressSearch('ratapihantie 13, 00520 hki');
        let features = response.features;

        assert.equal(features.length, 1);
        assert.equal(features[0].properties.label, 'Ratapihantie 13, Helsinki');
    });

    test('Searching by place name returns correct properties', async () => {
        let response = await addressSearch('Haaga-Helia Pasila, Helsinki');
        let features = response.features;

        assert.equal(features.length, 1);
        assert.equal(features[0].properties.label, 'Haaga-Helia Pasila campus, Ratapihantie 13, Helsinki');
    });

    test('Special characters (& and ?) are escaped correctly', async () => {
        let response = await addressSearch('&? rock & roll');

        assert.ok(response !== null, 'Should get a response from the API even with ? and & in the search string');
    });

    test('Unknown keyword returns empty set of features', async () => {
        let response = await addressSearch('this_keyword_does_not_return_any_matches');
        let features = response.features;

        assert.equal(features.length, 0);
    });

    test('Size parameter can be used to specify the number of results', async () => {
        let response = await addressSearch('asema', 3);
        let features = response.features;

        assert.equal(features.length, 3);
    });

    test('An exception is thrown when the API responds with an HTTP error', async () => {
        let thrown = false;

        try {
            // empty search string should throw an exception
            await addressSearch('');
        } catch {
            thrown = true; // exception was thrown
        }

        assert.ok(thrown, 'An error should be thrown when the api responds with http 400');
    });
});
