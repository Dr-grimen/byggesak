/* Mangelsjekk for byggesøknader.
   Bygget på byggesaksforskriften (SAK10) § 5-4 tredje og fjerde ledd, som er
   listen kommunen faktisk kontrollerer mot. Sist endret 22.6.2023, i kraft
   1.1.2024. Sitatene er ordrett fra forskriften.

   DiBKs egne valideringsregler ligger bak innlogging på Fellestjenester BYGG,
   så vi bruker forskriften selv. Det er samme grunnlag, men uten kommunens
   lokale tillegg. Det står i forbeholdet.

   soknadstyper:
     ettrinn   – søknad om tillatelse i ett trinn (pbl § 20-3)
     ramme     – søknad om rammetillatelse (§ 5-4 fjerde ledd, reduserte krav)
     igangsett – søknad om igangsettingstillatelse
     utenansvar– søknad uten ansvarsrett (pbl § 20-4, SAK10 § 3-1)
*/

const SOKNADSTYPER = [
  { id: "ettrinn", navn: "Ett-trinns søknad", under: "Full søknad med ansvarlig søker" },
  { id: "ramme", navn: "Rammetillatelse", under: "Ytre rammer, reduserte krav" },
  { id: "igangsett", navn: "Igangsettingstillatelse", under: "Etter gitt rammetillatelse" },
  { id: "utenansvar", navn: "Uten ansvarsrett", under: "Tiltakshaver søker selv" }
];

const SAK_5_4 = "https://dibk.no/regelverk/sak/2/5/5-4/";
const PBL_URL = "https://lovdata.no/lov/2008-06-27-71";
const SAK10_N = "Byggesaksforskriften (SAK10)";
const PBL_N = "Plan- og bygningsloven (pbl)";

/* alvor: "stopp"  = søknaden blir normalt returnert eller satt på vent
          "mangel" = utløser mangelbrev, men saken kan gå videre
          "sjekk"  = ofte oversett, ikke alltid påkrevd */
const PUNKTER = [
  {
    id: "tiltakshaver", tittel: "Tiltakshaver er oppgitt",
    hjelp: "Navn, adresse og kontaktopplysninger på den tiltaket utføres for. Ved firma: organisasjonsnummer.",
    para: "§ 5-4 tredje ledd bokstav a", sitat: "tiltakshaver", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "igangsett", "utenansvar"], alvor: "stopp"
  },
  {
    id: "eiendom", tittel: "Eiendom og eksisterende bebyggelse",
    hjelp: "Gårds- og bruksnummer, adresse, og hva som står på eiendommen fra før.",
    para: "§ 5-4 tredje ledd bokstav b", sitat: "eiendom og eksisterende bebyggelse som berøres av tiltaket", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "igangsett", "utenansvar"], alvor: "stopp"
  },
  {
    id: "art", tittel: "Beskrivelse av tiltakets art",
    hjelp: "Hva som skal bygges, endres eller rives, og hva det skal brukes til.",
    para: "§ 5-4 tredje ledd bokstav c", sitat: "beskrivelse av tiltakets art", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "igangsett", "utenansvar"], alvor: "stopp"
  },
  {
    id: "utnytting", tittel: "Størrelse og grad av utnytting",
    hjelp: "BYA og BRA før og etter tiltaket, regnet mot tomtearealet, med utregningen vist. Husk 18 m² per utendørs parkeringsplass.",
    para: "§ 5-4 tredje ledd bokstav d", sitat: "tiltakets størrelse og grad av utnytting", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp",
    vanlig: "Dette er den hyppigste mangelen. Kommunen vil se selve regnestykket, ikke bare sluttallet."
  },
  {
    id: "plan", tittel: "Forholdet til plangrunnlaget",
    hjelp: "Hvilken plan som gjelder, og hvordan tiltaket forholder seg til formål, byggegrense, høyde og utnytting. Gjelder også pbl § 1-8 om strandsonen.",
    para: "§ 5-4 tredje ledd bokstav e", sitat: "forhold til plangrunnlaget og plan- og bygningsloven § 1-8", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp",
    vanlig: "Hold denne opp mot plansjekken for tomta."
  },
  {
    id: "utforming", tittel: "Universell utforming og arkitektonisk utforming",
    hjelp: "Visuelle kvaliteter og tilpasning til omgivelsene. Krav om tilgjengelighet gjelder ikke alle småhus.",
    para: "§ 5-4 tredje ledd bokstav f", sitat: "ivaretakelse av krav til universell utforming og arkitektonisk utforming, herunder visuelle kvaliteter", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme"], alvor: "mangel"
  },
  {
    id: "naturfare", tittel: "Sikkerhet mot natur- og miljøforhold",
    hjelp: "Flom, skred, radon, forurenset grunn og støy. Ligger tomta i et aktsomhetsområde, må sikkerheten dokumenteres.",
    para: "§ 5-4 tredje ledd bokstav g", sitat: "tiltakets sikkerhet mot fare eller vesentlig ulempe som følge av natur- eller miljøforhold, og behov for eventuelle sikringstiltak", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp",
    vanlig: "Sjekk NVEs aktsomhetskart for tomta. Treff her stopper saken til det er dokumentert."
  },
  {
    id: "klima", tittel: "Konsekvensanalyse etter TEK17 § 9-4",
    hjelp: "Gjelder klimagassregnskap for større bygg. Ofte ikke relevant for småhus og tilbygg.",
    para: "§ 5-4 tredje ledd bokstav h", sitat: "konsekvensanalyse som framgår av byggteknisk forskrift § 9-4", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme"], alvor: "sjekk"
  },
  {
    id: "avstand", tittel: "Minsteavstander",
    hjelp: "Til annen bebyggelse, kraftlinjer, vegmidte og vann- og avløpsledninger. Mål dem på situasjonsplanen.",
    para: "§ 5-4 tredje ledd bokstav i", sitat: "minsteavstand til annen bebyggelse, kraftlinjer, vegmidte, vann- og avløpsledninger", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp",
    vanlig: "Avstand til VA-ledninger blir glemt oftest. Be om ledningskart fra kommunen."
  },
  {
    id: "vaatkomst", tittel: "Atkomst, vann, avløp og overvann",
    hjelp: "Hvordan tomta får atkomst, vann og avløp, hvor overvannet tar veien, og flomveier. Ved ny avkjørsel: tillatelse fra vegmyndigheten.",
    para: "§ 5-4 tredje ledd bokstav j", sitat: "atkomst, vannforsyning, avløp, avledning av overvann, flomveier for overvann og fjernvarmetilknytning", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp",
    vanlig: "Overvann og flomveier er nytt for mange og blir ofte utelatt."
  },
  {
    id: "disp", tittel: "Dispensasjon er søkt særskilt",
    hjelp: "Bryter tiltaket planen på ett punkt, må du søke dispensasjon i eget brev med begrunnelse etter pbl § 19-1. Naboene skal varsles særskilt om dispensasjonen.",
    para: "§ 5-4 tredje ledd bokstav k", sitat: "eventuelt behov og grunnlag for dispensasjon", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp",
    vanlig: "En dispensasjon som ikke er søkt om, men som trengs, gjør hele søknaden ufullstendig."
  },
  {
    id: "forhandskonferanse", tittel: "Opplyst om forhåndskonferanse",
    hjelp: "Si om det er holdt forhåndskonferanse, og legg ved referatet hvis det finnes.",
    para: "§ 5-4 tredje ledd bokstav l", sitat: "om det er avholdt forhåndskonferanse", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme"], alvor: "mangel"
  },
  {
    id: "tegninger", tittel: "Tegninger og målsatt situasjonsplan",
    hjelp: "Plan, snitt og fasader i målestokk, og situasjonsplan med tiltaket inntegnet og alle avstander målsatt.",
    para: "§ 5-4 tredje ledd bokstav m", sitat: "tegninger og målsatt situasjonsplan", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp",
    vanlig: "Situasjonsplan uten mål er en klassiker. Målene må stå på tegningen."
  },
  {
    id: "nabovarsel", tittel: "Nabovarsel med kvittering",
    hjelp: "Alle naboer og gjenboere skal varsles før søknaden sendes. Kvittering og eventuelle merknader legges ved, med din kommentar til merknadene.",
    para: "§ 5-4 tredje ledd bokstav n", sitat: "redegjørelse for nabovarsling og nabomerknader, samt kvittering for nabovarsel", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp",
    vanlig: "Naboene har 14 dagers frist. Sender du søknaden før fristen er ute, er den ufullstendig."
  },
  {
    id: "andremynd", tittel: "Forholdet til andre myndigheter",
    hjelp: "Vegvesen, Arbeidstilsynet, kulturminnemyndighet, brannvesen, NVE. Samtykke eller uttalelse legges ved.",
    para: "§ 5-4 tredje ledd bokstav o", sitat: "forholdet til andre myndigheter", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "mangel"
  },
  {
    id: "gjennomforing", tittel: "Gjennomføringsplan",
    hjelp: "Oversikt over ansvarsområder og samsvarserklæringer gjennom hele saken.",
    para: "§ 5-4 tredje ledd bokstav p", sitat: "gjennomføringsplan", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "igangsett"], alvor: "stopp"
  },
  {
    id: "ansvarsrett", tittel: "Erklæringer om ansvarsrett",
    hjelp: "Fra alle foretak som skal ha ansvar, for de fagområdene de dekker.",
    para: "§ 5-4 tredje ledd bokstav q", sitat: "erklæringer om ansvarsrett", url: SAK_5_4, dok: SAK10_N,
    gjelder: ["ettrinn", "igangsett"], alvor: "stopp",
    vanlig: "Ved rammetillatelse holder det med ansvarlig søker. Resten kommer ved igangsetting."
  },
  /* Punkter utenfor § 5-4 som likevel utløser mangelbrev */
  {
    id: "nabofrist", tittel: "14-dagersfristen for naboer er ute",
    hjelp: "Søknaden kan ikke sendes før naboene har hatt 14 dager på seg fra varselet er sendt.",
    para: "§ 21-3", sitat: "Før søknad sendes inn, skal naboer og gjenboere varsles av søkeren hvis ikke disse skriftlig har meddelt at de ikke har merknader.", url: PBL_URL, dok: PBL_N,
    gjelder: ["ettrinn", "ramme", "utenansvar"], alvor: "stopp"
  },
  {
    id: "signatur", tittel: "Søknaden er signert av tiltakshaver",
    hjelp: "Manglende signatur er en formell mangel som stopper saken.",
    para: "§ 5-5 bokstav g", sitat: "Kopi av søknad med tiltakshavers signatur", url: "https://dibk.no/regelverk/sak/2/5/5-5/", dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "igangsett", "utenansvar"], alvor: "stopp"
  },
  {
    id: "gebyr", tittel: "Riktig blankett og skjema",
    hjelp: "Blankett 5174 med ansvarsrett, 5153 uten ansvarsrett. Sendes digitalt via kommunens løsning eller Fellestjenester BYGG.",
    para: "§ 5-1", sitat: "Søknad, nabovarsel, søknad om ansvarsrett og andre erklæringer etter forskriften her skal gis på den måten kommunen bestemmer.", url: "https://dibk.no/regelverk/sak/2/5/5-1/", dok: SAK10_N,
    gjelder: ["ettrinn", "ramme", "igangsett", "utenansvar"], alvor: "mangel"
  },
  {
    id: "avfall", tittel: "Avfallsplan og miljøkartlegging",
    hjelp: "Kreves ved nybygg over 300 m², rehabilitering over 100 m², og ved riving. Miljøkartlegging ved arbeid på bygg fra før 2010.",
    para: "§ 5-5 bokstav h", sitat: "Avfallsplan og miljøkartlegging", url: "https://dibk.no/regelverk/sak/2/5/5-5/", dok: SAK10_N,
    gjelder: ["ettrinn", "igangsett"], alvor: "sjekk"
  }
];

function relevantePunkter(type) {
  return PUNKTER.filter(p => p.gjelder.includes(type));
}

/* avkryssing = { id: true | false | "na" }  ("na" = ikke relevant for dette tiltaket) */
function sjekk(type, avkryssing) {
  const rel = relevantePunkter(type);
  const mangler = [], ok = [], na = [], ubesvart = [];
  rel.forEach(p => {
    const v = avkryssing[p.id];
    if (v === "na") na.push(p);
    else if (v === true) ok.push(p);
    else if (v === false) mangler.push(p);
    else ubesvart.push(p);
  });
  const stopp = mangler.filter(p => p.alvor === "stopp");
  const smaa = mangler.filter(p => p.alvor === "mangel");
  const sjekkpkt = mangler.filter(p => p.alvor === "sjekk");
  const ferdig = ubesvart.length === 0;
  let dom;
  if (stopp.length) {
    dom = { niva: "bad", tittel: `${stopp.length} ${stopp.length === 1 ? "mangel" : "mangler"} som normalt stopper saken`, under: "Kommunen vil be om tilleggsopplysninger, og fristen begynner ikke å løpe før alt er inne. Fra 2025 kan søknaden avvises hvis den ikke rettes innen fristen." };
  } else if (smaa.length) {
    dom = { niva: "warn", tittel: `${smaa.length} ${smaa.length === 1 ? "punkt" : "punkter"} kan utløse mangelbrev`, under: "Ingenting stopper saken, men dette er punkter kommunen ofte etterspør. Ta dem med, så sparer du en runde." };
  } else if (sjekkpkt.length) {
    dom = { niva: "warn", tittel: "Se over de siste punktene", under: "Ingenting påkrevd mangler. Vurder om punktene under gjelder for ditt tiltak." };
  } else if (!ferdig) {
    dom = { niva: "neutral", tittel: "Ingen mangler så langt", under: "Ingenting du har svart nei på hittil. Gå gjennom resten av listen for en full vurdering." };
  } else {
    dom = { niva: "ok", tittel: "Søknaden ser komplett ut", under: "Alle punktene i byggesaksforskriften § 5-4 er kvittert ut. Kommunens frist begynner å løpe fra den dagen de mottar søknaden." };
  }
  return { dom, stopp, smaa, sjekkpkt, ok, na, ubesvart, ferdig, antall: rel.length };
}

const SJEKK_FORBEHOLD = [
  "Listen bygger på byggesaksforskriften § 5-4 tredje og fjerde ledd, sist endret 22. juni 2023 med virkning fra 1. januar 2024.",
  "DiBKs egne valideringsregler i Fellestjenester BYGG krever innlogging, så vi bruker forskriften direkte. Kommunen kan i tillegg ha lokale krav.",
  "Dette er en sjekkliste, ikke en gjennomlesning av søknaden din. Vi ser ikke innholdet i dokumentene dine.",
  "Kommunen avgjør alltid om en søknad er fullstendig."
];
