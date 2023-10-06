# TypeScript, REST ja GraphQL

Tässä tehtävässä harjoitellaan HTTP-rajapintojen hyödyntämistä TypeScript-kielellä Node.js-ympäristössä.

Tehtävä on kaksiosainen:

1. Ensimmäisessä osassa sinun tulee hakea käyttäjän antamaa paikan nimeä vastaavat sijaintitiedot [Digitransit-palvelun rajapinnasta](https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/). Tämä osa testataan valmiilla Jest-yksikkötesteillä.

2. Toisessa osassa sinun tulee hyödyntää [reittioppaan](https://www.hsl.fi/) taustalla toimivaa [GraphQL-reitityspalvelua](https://digitransit.fi/en/developers/apis/1-routing-api/0-graphql/) etsiäksesi reitin kahden käyttäjän määrittelemän paikan välillä. Tämä osa testataan suorittamalla koodisi ja tarkastamalla ehdotettu reitti.


## Mikä on GraphQL?

GraphQL-rajapintoihin tutustumiseksi suosittelemme seuraavia kahta videota:

[**GraphQL Explained in 100 Seconds**](https://www.youtube.com/watch?v=eIQh02xuVw4) by Fireship *2:22*


[**GraphQL Client Tutorial With Fetch**](https://www.youtube.com/watch?v=0ZJI4cBS4JM) by Web Dev Simplified *15:37*

Lisäksi ennen tehtävän toisen osan aloitusta suosittelemme lukemaan Digitransitin [GraphQL](https://digitransit.fi/en/developers/apis/1-routing-api/0-graphql)- sekä [GraphiQL](https://digitransit.fi/en/developers/apis/1-routing-api/1-graphiql/)-sivut.


## API-avaimet ja tunnistautuminen 🔐

Digitransit-rajapinnat vaativat tunnistautumista API-avainten avulla. Palveluun rekisteröityminen onnistuu halutessasi ilmaiseksi osoitteessa https://portal-api.digitransit.fi/. Rekisteröinnin jälkeen voit "tilata" itsellesi "Digitransit developer API"-palvelun "Products"-välilehdellä. Tilauksen jälkeen löydät API-avaimesi "Profile"-välilehdeltä. Vaihtoehtoisesti voit ratkaista tehtävän luomalla siitä GitHub codespace:n. Codespace:ssa API-avain on valmiiksi saatavilla `DIGITRANSIT_API_KEY`-ympäristömuuttujassa.

Rajapintakutsuissa tunnistautuminen onnistuu varsin yksinkertaisesti. Sinun tulee vain lisätä jokaiseen HTTP-pyyntöön `digitransit-subscription-key`-niminen parametri tai "header":

> *"An API key can be included either as a URL parameter or as a header. The parameter and the header name are both `digitransit-subscription-key` and the value should be the key."*
>
> https://digitransit.fi/en/developers/api-registration/

Älä tallenna API-avaintasi suoraan lähdekoodiin, äläkä lisää sitä versionhallintaan. Sen sijaan käytä määrittele API-avainta varten [ympäristömuuttuja](https://www.google.com/search?q=how+to+set+an+environment+variable) ja anna sille nimeksi `DIGITRANSIT_API_KEY`. Tämän jälkeen API-avainta voidaan käyttää koodissa esim. seuraavasti:

```ts
let apiKey = process.env['DIGITRANSIT_API_KEY'];
```

Ympäristömuuttujien käytön helpottamiseksi tehtäväpohjassa on valmiiksi asennettuna [dotenv-paketti](https://www.npmjs.com/package/dotenv). Voit halutessasi määritellä ympäristömuuttujat `.env`-nimiseen tiedostoon, jotka dotenv kopioi ympäristömuuttujiksi. Tätä `.env`-tiedostoa **ei tule lisätä versionhallintaan** ja se onkin rajattu pois versionhallinnasta [.gitignore](./.gitignore)-tiedoston avulla.

💡 *API-avainta käytetään myös GitHub classroom -palvelussa tehtävää tarkastettaessa. Tarkastusympäristössä API-avain on `DIGITRANSIT_API_KEY`-ympäristömuuttujassa, joten on tärkeää, että käytät omassa koodissasi saman nimistä muuttujaa.*


## Riippuvuuksien asentaminen 📦

Aloita asentamalla projektin riippuvuudet, jotka on määritelty `package.json`-tiedostossa:

```sh
$ npm install
```

Riippuvuudet sisältävät sekä [TypeScript-kielen](https://www.npmjs.com/package/typescript), [Jest-testaustyökalun](https://www.npmjs.com/package/jest) että [`ts-node`](https://www.npmjs.com/package/ts-node)- ja [`ts-jest`](https://www.npmjs.com/package/ts-jest)-paketit TypeScript-kielisen koodin ja testien suorittamiseksi Node.js:llä.

Riippuvuuksista löytyy myös [`node-fetch`](https://www.npmjs.com/package/node-fetch), joka mahdollistaa selaimista tutun `fetch`-funktion hyödyntämisen REST-rajapinnan kutsumiseksi. Node.js:n [versiosta 18 alkaen](https://nodejs.org/dist/latest/docs/api/globals.html#fetch) `fetch`-funktio kuuluu osaksi standardikirjastoa, eikä vaadi enää erillistä asennusta.

Lisäksi riippuvuuksissa on [dotenv-paketti](https://www.npmjs.com/package/dotenv), jonka avulla ympäristömuuttujat saadaan luettua paikallisesta `.env`-nimisestä tiedostosta. Paketin käyttäminen edellyttää lähdekoodiin `import`-komentoa, joka löytyy valmiina [addressSearch.ts](./src/addressSearch.ts)-tiedostosta:

```ts
// see https://www.npmjs.com/package/dotenv
require('dotenv').config();

// ympäristömuuttuja on nyt luettu .env-tiedostosta
let apiKey = process.env['DIGITRANSIT_API_KEY'];
```

## Osa 1: Perinteinen JSON-rajapinta (2p)

Tässä osassa sinun tulee toteuttaa funktio, joka ottaa parametrinaan paikan nimen merkkijonona, esimerkiksi "suomenlinna". Funktion tulee palauttaa annettua hakutermiä vastaavat sijaintitiedot hyödyntäen Digitransit-palvelun [Geocoding API:a](https://digitransit.fi/en/developers/apis/2-geocoding-api/):

> *"An address is matched to its corresponding geographic coordinates and in the simplest search, you can provide only one parameter, the text you want to match in any part of the location details."*
>
> https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/

Funktio tulee toteuttaa [addressSearch.ts](./src/addressSearch.ts)-tiedostoon, jossa löydät valmiin pohjan `addressSearch`-funktiolle. Funktio testataan valmiilla [automaattisilla testeillä](./src/addressSearch.test.ts), joten et saa muuttaa funktion nimeä etkä siihen liittyviä parametreja tai tyyppejä.

Funktion toteuttamiseksi sinun tulee tutustua [address search -rajapinnan dokumentaatioon](https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/).

Rajapinta vastaa pyyntöihin JSON-muodossa ja vastausten rakenne on kuvattu kattavasti dokumentaatiossa. Oman funktiosi tulee noudattaa tätä samaa rakennetta ja palauttaa [`AddressSearchResponse`](./src/types/GeocodingApi.ts)-tyyppinen olio. Tarvitsemasi TypeScript-tyyppi löytyy valmiina [src/types/GeocodingApi.ts](./src/types/GeocodingApi.ts)-tiedostosta.

Suosittelemme kokeilemaan rajapintaa myös selaimen kautta, esimerkiksi seuraavalla osoitteella:

```
https://api.digitransit.fi/geocoding/v1/search?text=kamppi&size=3
```

Huomaa, että rajapinnan vastaus sisältää huomattavasti enemmän tietoa kuin mitä tehtävässä tarvitsemme. Omassa sovelluksessamme tarvitsemme vain `features`-taulukkoa, joka sisältää varsinaiset löydetyt sijaintitiedot.


### Fetch-funktio

Tiedostossa on valmiiksi käytössä [`fetch`-funktio](https://www.npmjs.com/package/node-fetch), jonka avulla voit tehdä tarvittavan HTTP-pyynnön.

Fetch-funktio on *asynkroninen* joten funktiossa täytyy hyödyntää Promise-objekteja tai `async`- ja `await`-avainsanoja.


### Hakusanan enkoodaus

Huomaa, että funktiolle annettava hakusana saattaa sisältää erikoismerkkejä, jotka joko eivät ole sallittuja HTTP-parametreissa tai jotka muuttavat pyynnön merkitystä. Et voi siis asettaa hakusanaa suoraan osaksi URL-osoitetta, vaan se tulee [enkoodata](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent), esim. `'töölönlahti 1'` &rarr; `'t%C3%B6%C3%B6l%C3%B6nlahti%201'`.


### Virheiden käsittely

`fetch`-funktio heittää poikkeuksen, mikäli esimerkiksi sille annettu data on virheellistä tai pyyntöön ei saada lainkaan vastausta. `fetch` ei kuitenkaan heitä poikkeusta, mikäli vastaus saadaan, vaikka vastauksen HTTP-statuskoodi viittaisi virheeseen kuten `400` tai `500`.

`addressSearch`-funktiosi tulee varmistaa, että saatu vastaus on "OK" ja mikäli se ei ole, funktion tulee heittää poikkeus.


### Tehtävän testaaminen

Tehtävän yksikkötestit suoritetaan [Jest-työkalun](https://jestjs.io/) avulla komennolla `npm test`:

```sh
$ npm test
```


## Osa 2: GraphQL-rajapinta (3p)

Tehtävän toisessa osassa tarkoituksena on hyödyntää edellä toteutettua osoitehakua sekä Routing API:a ja toteuttaa oma reittiopasta vastaava komentorivikäyttöliittymä.

> *"Routing API provides a way to plan itineraries and query public transportation related information about stops and timetables using GraphQL."*
>
> https://digitransit.fi/en/developers/apis/1-routing-api/

Voit toteuttaa käyttöliittymäsi varsin vapaasti omien mieltymystesi mukaiseksi. Ohjelma on kuitenkin automaattisen arvioinnin vuoksi voitava suorittaa esim. komennolla:

```sh
$ npm start "helsinki-vantaa lentoasema" "suomenlinna"
```

Seuraavassa esimerkissä käyttäjän syöttämät sijaintitiedot annetaan ensin `addressSearch`-funktiolle ja näitä sijaintitietoja käytetään Routing API:n kanssa reittiehdotusten näyttämiseksi:

```
$ npm start "helsinki-vantaa lentoasema" "suomenlinna"

> start
> ts-node src/index.ts helsinki-vantaa lentoasema suomenlinna

From: Helsinki-Vantaan lentoasema, Lentoasemantie 1, Vantaa
To:   Suomenlinna, Helsinki

### 7:42:33 AM - 8:55:25 AM, 72 minutes ###

🚶‍  Origin -> Lentoasema
7:42:33 AM - 7:52:00 AM, 9 minutes

🚆 P Lentoasema -> Helsinki
7:52:00 AM - 8:21:00 AM, 29 minutes

🚶‍  Helsinki -> Kauppatori
8:21:00 AM - 8:37:22 AM, 16 minutes

🚢 19 Kauppatori -> Suomenlinna, päälait
8:40:00 AM - 8:55:00 AM, 15 minutes

🚶‍  Suomenlinna, päälait -> Destination
8:55:00 AM - 8:55:25 AM, 0 minutes
```

`npm start` aloittaa ohjelman suorituksen tiedostosta [src/index.ts](./src/index.ts), mutta sinun kannattaa todennäköisesti jakaa ohjelmaasi pienempiin osiin ja luoda myös uusia tiedostoja.

Oman sovelluksesi ei tarvitse tulostaa kaikkia edellä esitettyjä tietoja. Esimerkiksi kellonajat, matkojen kestot ja emoji-merkit ovat tehtävän näkökulmasta ylimääräisiä. Automaattisen arvioinnin vuoksi matkaehdotuksen jokaiselle osuudelle ("leg") tulee kuitenkin tulostaa vähintään lähtöpaikan ja määränpään nimet (`leg.from.name` ja `leg.to.name`).

Voit halutessasi tulostaa vain yhden tai useampia vaihtoehtoisia reittiehdotuksia.

### GraphiQL

Suosittelemme hyödyntämään tehtävää tehdessäsi Digitransitin GraphiQL-palvelua. GraphiQL:n avulla kyselyiden muodostaminen ja suorittaminen on suoraviivaista. Se osaa myös täydentää automaattisesti sallitut attribuutit kullekin tietotyypille.

> *"It is highly recommended to use GraphiQL when familiarizing yourself with the Routing API."*
>
> *"[GraphiQL](https://github.com/graphql/graphiql) is a simple UI for making queries. You can use it both to run queries and to explore the GraphQL schema."*
>
> https://digitransit.fi/en/developers/apis/1-routing-api/1-graphiql/

Voit kokeilla [yllä esitetyn käyttöliittymän taustalla olevaa kyselyä GraphiQL-käyttöliittymässä](https://api.digitransit.fi/graphiql/hsl?query=%257B%250A%2520%2520%2520%2520plan%28%250A%2520%2520%2520%2520%2520%2520%2520%2520from%253A%2520%257B%2520lat%253A%252060.318933%252C%2520lon%253A%252024.968296%2520%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520to%253A%2520%257B%2520lat%253A%252060.149087%252C%2520lon%253A%252024.984228%2520%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520numItineraries%253A%25201%250A%2520%2520%2520%2520%29%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520itineraries%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520startTime%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520endTime%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520walkTime%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520walkDistance%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520legs%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520from%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520name%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520lat%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520lon%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520to%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520name%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520lat%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520lon%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520startTime%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520endTime%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520mode%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520duration%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520distance%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520route%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520shortName%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520longName%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%257D%250A%2520%2520%2520%2520%2520%2520%2520%2520%257D%250A%2520%2520%2520%2520%257D%250A%257D):

```graphql
{
    plan(
        from: { lat: 60.318933, lon: 24.968296 }
        to: { lat: 60.149087, lon: 24.984228 }
        numItineraries: 1
    ) {
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
}
```

Yllä olevat koordinaattipisteet vastaavat paikkoja "Helsinki-Vantaan lentoasema, Lentoasemantie 1, Vantaa" sekä "Suomenlinna, Helsinki". Käytä tehtävän 1. osassa toteuttamaasi `addressSearch`-funktiota käyttäjän antamien paikkojen sijaintitietojen selvittämiseksi.


### Reititysrajapinta

Tehtävän ratkaisemiseksi sinun tulee hyödyntää Digitransit-palvelun dokumentaatiota https://digitransit.fi/en/developers/apis/1-routing-api/. Dokumentaatiosta löydät esimerkiksi tiedot rajapinnan URL-osoitteista sekä sallituista HTTP-metodeista ja vaadituista HTTP-headereista.

GraphQL-rajapinnan käyttäminen voi aluksi vaikuttaa ylivoimaiselta, mutta palvelun dokumentaatio sisältää lukuisia esimerkkejä sekä [testikäyttöliittymän](https://api.digitransit.fi/graphiql/hsl), joiden avulla pääset toivottavasti hyvin alkuun. Suosittelemme myös katsomaan tämän sivun yläosassa esitetyt videot ja keskustelemaan mahdollisista haasteista Teamsissa.


### Fetch-funktio

GraphQL-rajapinnan käyttämiseksi on olemassa lukuisia kirjastoja, jotka voivat tehdä tästä tehtävästä helpomman tai huonossa tapauksessa haastavamman.

Yksinkertaisimmillaan rajapintaa voidaan käyttää siten, että teet `fetch`-funktiolla kutsun, jossa GraphQL-haku on merkkijonona pyynnön rungossa (body):

```ts
let response = await fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
    headers: { 'Content-Type': 'application/graphql' },
    method: 'POST',
    body: '{ plan(...'
});
```

Rajapinta palauttaa vastauksen JSON-muodossa, joten voit käyttää tuttuun tapaan `json()`-metodia sen parsimiseksi:

```ts
let routing: RoutingResponse = await response.json();
```

### Tietotyypit

GraphQL-pyynnössä vastauksen rakenne riippuu rajapintaan tehdystä hausta. Tämän tehtävän kannalta oleellisimmat tietotyypit ovat `Plan`, `Itinerary`, `Leg` sekä `Place`. Nämä tietotyypit on dokumentoitu kattavasti Digitransit-palvelun [GraphiQL-palvelussa](https://api.digitransit.fi/graphiql/hsl). Suosittelemme myös tutustumaan lyhyeen ohjeistukseen siitä, miten tätä dokumentaatiota on tarkoitus käyttää: [reading schema docs](https://digitransit.fi/en/developers/apis/1-routing-api/1-graphiql/#reading-schema-docs).

Voit halutessasi hyödyntää tiedostossa [src/types/RoutingApi.ts](./src/types/RoutingApi.ts) olevia valmiita tyyppejä, mutta se ei ole välttämätöntä.


## Lisenssit ⚖

Tämän tehtävän on kehittänyt Teemu Havulinna ja se on lisensoitu [Creative Commons BY-NC-SA -lisenssillä](https://creativecommons.org/licenses/by-nc-sa/4.0/).


### Digitransit

> *"Digitransit Platform is an open source journey planning solution that combines several open source components into a modern, highly available route planning service. Route planning algorithms and APIs are provided by Open Trip Planner (OTP). OTP is a great solution for general route planning but in order to provide top-notch journey planning other components such as Mobile friendly user interface, Map tile serving, Geocoding, and various data conversion tools are needed. Digitransit platform provides these tools."*
>
> https://digitransit.fi/en/developers/