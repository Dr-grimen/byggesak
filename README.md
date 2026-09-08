# Kan jeg bygge?

Regelbasert forhåndsvurdering av byggetiltak. Statisk side, ingen backend, null driftskostnad.
Live: https://dr-grimen.github.io/byggesak/

Hver vurdering bærer dokument, paragraf, ordrett sitat og lenke.

## Filer
- `index.html` – grensesnitt, kart, geometri og datainnhenting
- `regler.js` – kilder, terskler og regelmotor (portert fra byggesjekk-prosjektet)

## Datakilder (alle åpne, med CORS)
| Hva | Kilde |
|---|---|
| Adresse, punktsøk | ws.geonorge.no/adresser/v1 |
| Eiendomsgrenser (teig) | wfs.geonorge.no matrikkelen-eiendomskart-teig |
| Kartbakgrunn | cache.kartverket.no WMTS |
| Naturfare | kart.nve.no (flom, kvikkleire, jord-/flomskred, steinsprang, snøskred) |
| Plandata Oslo | od2.pbe.oslo.kommune.no/cgi-bin/wms?map=REGULERING |
| Plandata Bergen | KPA2018, sitert ordrett fra bestemmelsene (PDF) |
| Eksisterende bygg | OpenStreetMap via Overpass (tre speil) |

## Regelverk
SAK10 § 4-1 og § 3-1, pbl § 20-3, § 29-4 og § 19-2, TEK17 § 5-7, § 11-6 og kap. 7, vegloven § 29.
Terskler kontrollert mot dibk.no 6.9.2026.

## Legge til en ny kommune
Legg et objekt i `PLANSETT` i `regler.js` med kommunenummer som nøkkel: plannavn, dokument-URL,
soner og regler (utnytting, høyde, mua, parkering) med ordrett sitat og paragraf. Resten går av seg selv.

## Kjør lokalt
`python3 -m http.server 8765` og åpne http://localhost:8765
