# Kan jeg bygge?

Forhåndssjekk av garasje, tilbygg og terrasse mot tomta. Statisk side, ingen backend.

- Adresser og tomtegrenser: Kartverket (åpne API-er med CORS)
- Plandata: Oslo kommune PBE sin WMS (åpen). Andre kommuner: manuell inntasting foreløpig
- Eksisterende bygg: OpenStreetMap via Overpass
- Regler: SAK10 § 4-1 og § 3-1, pbl § 29-4, TEK17 § 5-2

Kjør lokalt: `python3 -m http.server 8765` og åpne http://localhost:8765
