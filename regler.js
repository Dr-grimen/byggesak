/* Regelmotor for byggesak.
   Kilder, terskler og logikk er portert fra byggesjekk (Python), slik at hver
   vurdering bærer dokument, paragraf, ordrett sitat og lenke.
   Terskler kontrollert mot dibk.no 6.9.2026. Bergen-sitatene er hentet ordrett
   fra KPA2018-bestemmelsene (PDF, 6.9.2026).
   Alt som ikke er kjent blir eksplisitt "må sjekkes". Ingen stille antakelser. */

const URL_SAK_4_1 = "https://dibk.no/regelverk/sak/2/4/4-1/";
const URL_SAK_3_1 = "https://dibk.no/regelverk/sak/2/3/3-1/";
const URL_PBL = "https://lovdata.no/lov/2008-06-27-71";
const SAK10 = "Byggesaksforskriften (SAK10)";
const PBL = "Plan- og bygningsloven (pbl)";
const TEK17 = "Byggteknisk forskrift (TEK17)";

const K = {
  SAK_4_1_INN: { dok: SAK10, para: "§ 4-1 første ledd", url: URL_SAK_4_1, sitat: "Oppføring, endring, fjerning, riving og opparbeidelse av følgende tiltak er unntatt fra kravet om byggesaksbehandling, dersom tiltaket ikke er i strid med lovens bestemmelser med tilhørende forskrifter, kommuneplanens arealdel og reguleringsplan, tillatelser eller annet regelverk" },
  SAK_4_1_A: { dok: SAK10, para: "§ 4-1 første ledd bokstav a", url: URL_SAK_4_1, sitat: "Frittliggende bygning på bebygd eiendom som ikke skal brukes til beboelse, og som verken har et samlet bruksareal (BRA) eller bebygd areal (BYA) på over 50 m². Mønehøyden skal ikke være over 4,0 m og gesimshøyde ikke over 3,0 m. Høyde måles i forhold til ferdig planert terrengs gjennomsnittsnivå rundt bygningen. Bygningen kan oppføres i én etasje og kan ikke underbygges med kjeller. Tiltaket kan plasseres inntil 1,0 m fra nabogrense og annen bygning på eiendommen. Bygningen må ikke plasseres over ledninger i grunnen." },
  SAK_4_1_B: { dok: SAK10, para: "§ 4-1 første ledd bokstav b", url: URL_SAK_4_1, sitat: "Tilbygg som verken har et samlet bruksareal (BRA) eller bebygd areal (BYA) på over 15 m². Tilbygget må være understøttet. Tilbygget kan ikke overstige to etasjer eller plan på det eksisterende byggverket." },
  SAK_4_1_D: { dok: SAK10, para: "§ 4-1 første ledd bokstav d", url: URL_SAK_4_1, sitat: "Terrasse som har en høyde på inntil 1,0 m fra eksisterende terreng, er forbundet med en bygning, og ikke stikker lenger ut fra bygningens fasadeliv enn 4,0 m. Slike terrasser kan ha et tilhørende rekkverk på inntil 1,2 m, men kan ikke være overbygde. Avstanden til nabogrensen skal være minst 1,0 m." },
  SAK_4_1_LEVEGG: { dok: SAK10, para: "§ 4-1 første ledd bokstav f", url: URL_SAK_4_1, sitat: "Levegg (skjermvegg) med høyde inntil 1,8 m og lengde inntil 10,0 m. Leveggen kan være frittstående eller forbundet med bygning, og avstand til nabogrense skal ikke være mindre enn 1,0 m. Levegg med høyde inntil 1,8 m og lengde inntil 5,0 m kan plasseres inntil nabogrense." },
  SAK_4_1_MUR: { dok: SAK10, para: "§ 4-1 første ledd bokstav f", url: URL_SAK_4_1, sitat: "Mindre forstøtningsmur på inntil 1,0 m høyde og avstand fra nabogrense på minst 1,0 m eller forstøtningsmur på inntil 1,5 m høyde og avstand fra nabogrense på minst 4,0 m. Muren må ikke hindre sikten i frisiktsoner mot veg." },
  SAK_4_1_MELDING: { dok: SAK10, para: "§ 4-1 fjerde ledd", url: URL_SAK_4_1, sitat: "For tiltak etter første ledd bokstav a, b og c skal tiltakshaver melde fra til kommunen senest fire uker etter ferdigstillelse (dato, matrikkelnummer, kart med plassering, areal, bygningstype og bruksformål)." },
  SAK_3_1_A: { dok: SAK10, para: "§ 3-1 bokstav a", url: URL_SAK_3_1, sitat: "et enkelt tilbygg hvor verken samlet bruksareal (BRA) eller bebygd areal (BYA) er over 50 m². Tilbygget kan i tillegg være underbygget med kjeller." },
  SAK_3_1_B: { dok: SAK10, para: "§ 3-1 bokstav b", url: URL_SAK_3_1, sitat: "En enkelt frittliggende bygning som ikke skal brukes til beboelse, og hvor verken samlet bruksareal (BRA) eller bebygd areal (BYA) er over 70 m². Bygningen kan oppføres i inntil én etasje og kan i tillegg være underbygget med kjeller." },
  PBL_20_3: { dok: PBL, para: "§ 20-3", url: URL_PBL, sitat: "Søknadspliktige tiltak som krever ansvarlige foretak (ansvarlig søker, prosjekterende, utførende)." },
  PBL_29_4_AVSTAND: { dok: PBL, para: "§ 29-4 andre ledd", url: URL_PBL, sitat: "Hvis ikke annet er bestemt i plan etter kapittel 11 eller 12, skal byggverk ha en avstand fra nabogrense som angitt i forskrift eller som minst svarer til byggverkets halve høyde og ikke under 4 meter." },
  PBL_29_4_HOYDE: { dok: PBL, para: "§ 29-4 første ledd", url: URL_PBL, sitat: "Bygning med gesimshøyde over 8 meter og mønehøyde over 9 meter kan bare føres opp hvor det har hjemmel i plan etter kapittel 11 eller 12." },
  PBL_29_4_UNNTAK: { dok: PBL, para: "§ 29-4 tredje ledd", url: URL_PBL, sitat: "Kommunen kan godkjenne at byggverk plasseres nærmere nabogrense enn nevnt i andre ledd eller i nabogrense: a) når eier (fester) av naboeiendommen har gitt skriftlig samtykke eller b) ved oppføring av frittliggende garasje, uthus og lignende mindre tiltak." },
  PBL_19_2: { dok: PBL, para: "§ 19-2", url: URL_PBL, sitat: "Dispensasjon kan ikke gis dersom hensynene bak bestemmelsen det dispenseres fra blir vesentlig tilsidesatt, og fordelene må være klart større enn ulempene." },
  PBL_21_3: { dok: PBL, para: "§ 21-3", url: URL_PBL, sitat: "Før søknad sendes inn, skal naboer og gjenboere varsles av søkeren hvis ikke disse skriftlig har meddelt at de ikke har merknader." },
  VEGL_29: { dok: "Vegloven", para: "§ 29", url: "https://lovdata.no/lov/1963-06-21-23", sitat: "Dersom ikkje anna er fastsett, skal byggegrensene gå i ein avstand av 50 meter frå riksveg og fylkesveg og 15 meter frå kommunal veg, rekna frå midtlina i vegen." },
  TEK_11_6: { dok: TEK17, para: "§ 11-6", url: "https://dibk.no/regelverk/byggteknisk-forskrift-tek17/11/ii/11-6/", sitat: "Byggverk skal plasseres og utformes slik at sannsynligheten for brannspredning mellom byggverk er liten. (Preakseptert ytelse: minst 8 m mellom byggverk, ellers brannskillende tiltak.)" },
  TEK_5_7: { dok: TEK17, para: "§ 5-7 / H-2300", url: "https://dibk.no/regelverk/byggteknisk-forskrift-tek17/5/5-7/", sitat: "Parkeringsareal inngår i beregningsgrunnlaget for grad av utnytting. 18 m² per biloppstillingsplass legges til når plassene ikke ligger i bygning." },
  TEK_7_1: { dok: TEK17, para: "kapittel 7", url: "https://dibk.no/regelverk/byggteknisk-forskrift-tek17/7/", sitat: "Byggverk skal plasseres, prosjekteres og utføres slik at det oppnås tilfredsstillende sikkerhet mot skade eller vesentlig ulempe fra naturpåkjenninger (flom, skred)." }
};

const M2_PER_BILPLASS = 18.0;

const G = {
  fri_m2: 50.0, fri_mone: 4.0, fri_gesims: 3.0, fri_avstand: 1.0,
  tilbygg_m2: 15.0, tilbygg_etasjer: 2,
  terrasse_hoyde: 1.0, terrasse_utstikk: 4.0,
  levegg_hoyde: 1.8, levegg_lengde: 10.0, levegg_lengde_grense: 5.0,
  mur_hoyde_1m: 1.0, mur_hoyde_4m: 1.5,
  tilbygg_uten_ansvar_m2: 50.0, fri_uten_ansvar_m2: 70.0,
  pbl_avstand: 4.0, pbl_gesims: 8.0, pbl_mone: 9.0,
  veg_riks: 50.0, veg_kommunal: 15.0, brann: 8.0
};

/* ---- Planregelsett per kommune. Sitat er ordrett fra bestemmelsene. ---- */
const PLANSETT = {
  "4601": {
    navn: "Kommuneplanens arealdel 2018 (KPA2018), Bergen kommune",
    planid: "4601_65270000", vedtatt: "19.6.2019",
    dok: "KPA2018 Bergen – Bestemmelser (rev. 19.6.2019)",
    url: "https://www.bergen.kommune.no/api/rest/filer/V90883",
    innsyn: "https://www.bergen.kommune.no/hvaskjer/tema/kommuneplanens-arealdel-2018",
    soner: [
      { id: "sone 3", navn: "Sone 3 – ytre fortettingssone" },
      { id: "sone 4", navn: "Sone 4 – øvrig byggesone" }
    ],
    regler: [
      { kat: "utnytting", sone: "sone 4", type: "%-BRA", maks: 45, para: "§ 26.5", sitat: "Grad av utnytting for ny bebyggelse skal være maks. 45 % BRA.", tekst: "Sone 4: maks 45 % BRA" },
      { kat: "utnytting", sone: "sone 3", type: "%-BRA", min: 30, maks: 120, para: "§ 26.4", sitat: "Grad av utnytting skal tilpasses omgivelsene, og skal være mellom 30 % og 120 % BRA.", tekst: "Sone 3: 30–120 % BRA" },
      { kat: "hoyde", sone: "sone 4", skjonn: true, para: "§ 26.5", sitat: "Byggehøyde skal tilpasses til omgivelser og terreng. Ny bebyggelse skal ikke gir vesentlig reduksjon av sol- og utsiktsforhold for eksisterende boliger.", tekst: "Sone 4: byggehøyde etter skjønn" },
      { kat: "hoyde", sone: "sone 3", skjonn: true, para: "§ 26.4", sitat: "Byggehøyde skal tilpasses til omgivelser og terreng. Ny bebyggelse bør ikke gi vesentlig reduksjon av sol- og utsiktsforhold for eksisterende boliger.", tekst: "Sone 3: byggehøyde etter skjønn" },
      { kat: "mua", sone: "sone 4", min: 100, enhet: "m² per boenhet", para: "§ 14.3.5", sitat: "Det skal etableres minimum 100 m2 uteoppholdsareal pr boenhet utformet som privat uteareal på tomten.", tekst: "Sone 4: min 100 m² uteoppholdsareal per boenhet" },
      { kat: "mua", sone: "sone 3", min: 75, enhet: "m² per boenhet", para: "§ 14.3.4", sitat: "Det skal etableres minimum 75 m2 uteoppholdsareal pr boenhet. Maks 40 % på tak/altan. Ved etablering av mer enn 3 boenheter skal minimum 40 % utformes som fellesareal eller offentlig areal. Alle enheter skal ha noe privat uteareal.", tekst: "Sone 3: min 75 m² uteoppholdsareal per boenhet" },
      { kat: "mua", skjonn: true, para: "§ 14.2", sitat: "Halve arealet på bakkeplan skal ha sol i 4 timer ved vårjevndøgn. Det skal skjermes mot vind.", tekst: "Solkrav til uteoppholdsareal" },
      { kat: "parkering", sone: "sone 4", min: 0.8, per100bra: true, minPerBoenhet: true, para: "§ 17", sitat: "0,8 er et minimum pr 100 m2, men det kreves minimum 1 plass pr boenhet, unntatt ytre fortettingssone, selv om utregning på bakgrunn av boligareal åpner for lavere parkeringsdekning.", tekst: "Sone 4: min 0,8 bilplasser per 100 m² BRA, minst 1 per boenhet" },
      { kat: "parkering", sone: "sone 3", min: 0.8, per100bra: true, para: "§ 17", sitat: "0,8 er et minimum pr 100 m2, men det kreves minimum 1 plass pr boenhet, unntatt ytre fortettingssone, selv om utregning på bakgrunn av boligareal åpner for lavere parkeringsdekning.", tekst: "Sone 3: min 0,8 bilplasser per 100 m² BRA" },
      { kat: "terreng", skjonn: true, para: "§ 8.2.9", sitat: "Nye byggetiltak skal ha god terrengtilpasning med minst mulig bruk av store skjæringer, fyllinger og murer.", tekst: "Terrengtilpasning" }
    ]
  }
};

/* ---- Hjelpere ---- */
const nf = (x, d = 1) => x === null || x === undefined || isNaN(x) ? "ukjent" : (Math.round(x * 10 ** d) / 10 ** d).toLocaleString("nb-NO");
const m = (x, d = 1) => nf(x, d) + " m";
const storsteAreal = (bya, bra) => Math.max(bya || 0, bra || 0);
function erMindreTiltak294(bya, bra, gesims, mone) {
  if (storsteAreal(bya, bra) > G.fri_m2) return false;
  if (gesims != null && gesims > G.fri_gesims) return false;
  if (mone != null && mone > G.fri_mone) return false;
  return true;
}
function planRegler(sett, kat, sone) {
  if (!sett) return [];
  const spes = sett.regler.filter(r => r.kat === kat && r.sone && sone && r.sone === sone);
  const gen = sett.regler.filter(r => r.kat === kat && !r.sone);
  return spes.concat(gen);
}
function kildeAv(sett, r) { return { dok: sett.dok, para: r.para, sitat: r.sitat, url: sett.url }; }

/* ---- Hovedvurdering ----
   inn = {
     type, bya, bra, gesims, mone, hoyde, utstikk, lengde, etasjer, kjeller, beboelse,
     understottet, nyeBoenheter, naboSamtykke,
     avstandNabo, avstandBygg, avstandVeg, vegtype,
     tomtAreal, eksBya, eksBra, boenheter, pIBygg, pUte,
     kommunenr, sone, maksBya (manuell %-BYA), minAvstand (manuell), farer: []
   } */
/* Plan- og bygningsloven gjelder ikke på Svalbard og Jan Mayen. */
const UTENFOR_PBL = { "2100": "Svalbard", "2211": "Jan Mayen" };

function vurder(inn) {
  const funn = [];
  const F = (regel, utfall, forklaring, kilde, beregning) => funn.push({ regel, utfall, forklaring, kilde, beregning });

  if (UTENFOR_PBL[inn.kommunenr]) {
    const sted = UTENFOR_PBL[inn.kommunenr];
    F("Plan- og bygningsloven gjelder ikke her", "brudd",
      `${sted} er ikke omfattet av plan- og bygningsloven. Byggesaker følger svalbardmiljøloven og arealplanen for planområdet, og behandles av Sysselmesteren eller Longyearbyen lokalstyre. Denne sjekken gjelder ikke for deg.`,
      { dok: "Plan- og bygningsloven", para: "§ 1-2", sitat: "Loven gjelder for hele landet, herunder vassdrag. For sjøområder gjelder loven ut til én nautisk mil utenfor grunnlinjene. Kongen kan bestemme at loven helt eller delvis skal gjelde for Svalbard.", url: URL_PBL });
    return {
      status: "utenfor", grunnstatus: "utenfor", funn,
      dokumentkrav: [`Ta kontakt med ${inn.kommunenr === "2100" ? "Longyearbyen lokalstyre eller Sysselmesteren på Svalbard" : "Sysselmesteren"} for å finne ut hva som kreves.`],
      nesteSteg: ["Ikke bruk denne rapporten som grunnlag. Regelverket her er et annet."],
      plan: null,
      forbehold: ["Denne tjenesten dekker bare fastlands-Norge, der plan- og bygningsloven gjelder."]
    };
  }
  const sett = PLANSETT[inn.kommunenr];
  const sone = inn.sone || null;
  const bygningstiltak = ["garasje", "tilbygg"].includes(inn.type);
  const areal = storsteAreal(inn.bya, inn.bra);
  const totalBya = (inn.eksBya || 0) + (inn.bya || 0);
  const totalBra = (inn.eksBra || 0) + (inn.bra || 0);
  const boenheter = (inn.boenheter || 1) + (inn.nyeBoenheter || 0);
  let planBrudd = false, pblBrudd = false;

  /* --- Parkering (regnes først: manglende uteplasser teller 18 m² i utnyttingen) --- */
  let parkeringstillegg = 0;
  const pReg = planRegler(sett, "parkering", sone).filter(r => r.min != null)[0];
  const garasjeplasser = inn.type === "garasje" ? Math.max(1, Math.floor((inn.bya || 0) / M2_PER_BILPLASS)) : 0;
  if (pReg) {
    if (!totalBra) {
      F("Parkeringskrav", "ukjent", `Planen krever ${pReg.tekst}. Oppgi bruksareal (BRA) for å regne ut kravet.`, kildeAv(sett, pReg));
    } else {
      let krav = Math.ceil(pReg.min * totalBra / 100 - 1e-9);
      if (pReg.minPerBoenhet) krav = Math.max(krav, boenheter);
      const iBygg = (inn.pIBygg || 0) + garasjeplasser;
      const tilgjengelig = iBygg + (inn.pUte || 0);
      const ber = `${nf(pReg.min)} × ${nf(totalBra, 0)} m² BRA / 100 = ${krav} plass(er)` + (pReg.minPerBoenhet ? `, minst 1 per boenhet` : "");
      if (tilgjengelig >= krav) {
        F("Parkeringskrav", "ok", `Krav ${krav} bilplass(er). Dekket av ${iBygg} i bygning${garasjeplasser ? ` (${garasjeplasser} i ny garasje)` : ""} og ${inn.pUte || 0} ute.`, kildeAv(sett, pReg), ber);
      } else {
        const mangler = krav - tilgjengelig;
        parkeringstillegg = mangler * M2_PER_BILPLASS;
        F("Parkeringskrav", "ukjent", `Krav ${krav} bilplass(er), du har oppgitt ${tilgjengelig}. Vis ${mangler} plass(er) til på situasjonsplanen. Hver utendørs plass teller ${M2_PER_BILPLASS} m² i grad av utnytting.`, kildeAv(sett, pReg), ber);
      }
    }
  }

  /* --- Grad av utnytting fra plan (Bergen: %-BRA) --- */
  let harPlanUtnytting = false;
  for (const r of planRegler(sett, "utnytting", sone)) {
    harPlanUtnytting = true;
    if (!inn.tomtAreal) { F("Grad av utnytting", "ukjent", `Planen setter ${r.tekst}. Tomteareal mangler.`, kildeAv(sett, r)); continue; }
    let verdi, ber;
    if (r.type === "%-BRA") {
      if (!totalBra) { F(`Grad av utnytting (${r.sone || "planen"})`, "ukjent", `Planen setter ${r.tekst}. Oppgi eksisterende bruksareal (BRA) for å regne ut.`, kildeAv(sett, r)); continue; }
      verdi = (totalBra + parkeringstillegg) / inn.tomtAreal * 100;
      ber = `(${nf(inn.eksBra || 0, 0)} + ${nf(inn.bra || 0, 0)} + ${nf(parkeringstillegg, 0)} m² parkering) / ${nf(inn.tomtAreal, 0)} m² = ${nf(verdi)} % BRA`;
    } else {
      verdi = (totalBya + parkeringstillegg) / inn.tomtAreal * 100;
      ber = `(${nf(inn.eksBya || 0, 0)} + ${nf(inn.bya || 0, 0)} + ${nf(parkeringstillegg, 0)} m² parkering) / ${nf(inn.tomtAreal, 0)} m² = ${nf(verdi)} % BYA`;
    }
    ber += ` (parkering: TEK17 § 5-7 / H-2300)`;
    if (r.maks != null && verdi > r.maks + 1e-9) {
      F(`Grad av utnytting (${r.sone || "planen"})`, "brudd", `${nf(verdi)} ${r.type} overstiger maks ${nf(r.maks)} %.`, kildeAv(sett, r), ber);
      planBrudd = true;
    } else {
      F(`Grad av utnytting (${r.sone || "planen"})`, "ok", `${nf(verdi)} ${r.type} er innenfor maks ${nf(r.maks)} %.`, kildeAv(sett, r), ber);
    }
  }

  /* --- Grad av utnytting fra manuelt innskrevet %-BYA (Oslo og andre) --- */
  if (!harPlanUtnytting && inn.tomtAreal) {
    const verdi = (totalBya + parkeringstillegg) / inn.tomtAreal * 100;
    const ber = `(${nf(inn.eksBya || 0, 0)} + ${nf(inn.bya || 0, 0)} m²) / ${nf(inn.tomtAreal, 0)} m² = ${nf(verdi)} % BYA`;
    if (inn.maksBya == null) {
      F("Grad av utnytting", "ukjent", `Tiltaket gir ${nf(verdi)} %-BYA. Vi vet ikke hva planen tillater. Finn maks %-BYA i planbestemmelsene og skriv det inn.`, inn.planKilde || null, ber);
    } else if (verdi > inn.maksBya + 1e-9) {
      F("Grad av utnytting", "brudd", `${nf(verdi)} %-BYA overstiger planens maks ${nf(inn.maksBya)} %.`, inn.planKilde || null, ber);
      planBrudd = true;
    } else {
      F("Grad av utnytting", "ok", `${nf(verdi)} %-BYA er innenfor planens maks ${nf(inn.maksBya)} %.`, inn.planKilde || null, ber);
    }
  }

  /* --- Byggehøyde etter plan (skjønn i Bergen) --- */
  if (bygningstiltak) for (const r of planRegler(sett, "hoyde", sone)) {
    if (r.skjonn) F(`Byggehøyde (${r.sone || "planen"})`, "ukjent", "Planen setter ingen tallgrense. Høyden vurderes etter tilpasning til omgivelser og terreng, og sol- og utsiktsforhold for naboer.", kildeAv(sett, r));
  }

  /* --- Uteoppholdsareal --- */
  if (bygningstiltak) for (const r of planRegler(sett, "mua", sone)) {
    if (r.skjonn || r.min == null) { F("Uteoppholdsareal – kvalitet", "ukjent", "Sol- og vindkrav må dokumenteres med sol- og skyggeanalyse ved søknad.", kildeAv(sett, r)); continue; }
    const krav = r.min * boenheter;
    if (!inn.tomtAreal) { F("Uteoppholdsareal (MUA)", "ukjent", `Krav ${nf(krav, 0)} m². Tomteareal mangler.`, kildeAv(sett, r)); continue; }
    const tilgjengelig = inn.tomtAreal - totalBya - parkeringstillegg - ((inn.pUte || 0) * M2_PER_BILPLASS);
    const ber = `${nf(inn.tomtAreal, 0)} − ${nf(totalBya, 0)} m² BYA − ${nf(parkeringstillegg + (inn.pUte || 0) * M2_PER_BILPLASS, 0)} m² parkering ≈ ${nf(tilgjengelig, 0)} m² (grovt anslag, kjøreareal ikke trukket fra)`;
    if (tilgjengelig < krav) { F("Uteoppholdsareal (MUA)", "brudd", `Anslått ${nf(tilgjengelig, 0)} m² er under kravet på ${nf(krav, 0)} m².`, kildeAv(sett, r), ber); planBrudd = true; }
    else F("Uteoppholdsareal (MUA)", "ok", `Anslått ${nf(tilgjengelig, 0)} m² dekker kravet på ${nf(krav, 0)} m².`, kildeAv(sett, r), ber);
  }

  /* --- Terrengtilpasning --- */
  for (const r of planRegler(sett, "terreng", sone)) F("Terrengtilpasning", "ukjent", r.sitat, kildeAv(sett, r));

  /* --- Nasjonalt spor: unntatt / uten ansvarsrett / med ansvarlig søker --- */
  let status = "ansvarlig";
  if (inn.type === "garasje") {
    // Unntaket gjelder bare på bebygd eiendom. Vet vi det ikke, sier vi det.
    if (inn.bebygd === false) {
      F("Unntak: Bebygd eiendom", "ukjent", "Vi fant ingen bygninger på tomta i kartet. Unntaket gjelder bare på bebygd eiendom. Er tomta ubebygd, er garasjen søknadspliktig.", K.SAK_4_1_A);
    } else {
      F("Unntak: Bebygd eiendom", "ok", "Det står bygninger på eiendommen fra før.", K.SAK_4_1_A);
    }
    const v = [
      ["Ikke til beboelse", !inn.beboelse, inn.beboelse ? "Bygning til beboelse er alltid søknadspliktig." : "Oppgitt at bygget ikke skal brukes til beboelse."],
      [`Areal ≤ ${G.fri_m2} m² (BRA og BYA)`, areal <= G.fri_m2, `Oppgitt ${nf(areal)} m².`],
      [`Mønehøyde ≤ ${nf(G.fri_mone)} m`, inn.mone != null && inn.mone <= G.fri_mone, `Oppgitt ${m(inn.mone)}.`],
      [`Gesimshøyde ≤ ${nf(G.fri_gesims)} m`, inn.gesims != null && inn.gesims <= G.fri_gesims, `Oppgitt ${m(inn.gesims)}.`],
      ["Én etasje, ikke kjeller", (inn.etasjer || 1) <= 1 && !inn.kjeller, `Oppgitt ${inn.etasjer || 1} etasje${inn.kjeller ? ", med kjeller" : ", uten kjeller"}.`],
      [`Minst ${nf(G.fri_avstand)} m fra nabogrense`, inn.avstandNabo != null && inn.avstandNabo >= G.fri_avstand, `Målt ${m(inn.avstandNabo, 2)}.`]
    ];
    if (inn.avstandBygg != null) v.push([`Minst ${nf(G.fri_avstand)} m fra annen bygning`, inn.avstandBygg >= G.fri_avstand, `Målt ${m(inn.avstandBygg, 2)}.`]);
    const alle = v.every(x => x[1]);
    v.forEach(x => F(`Unntak: ${x[0]}`, x[1] ? "ok" : "brudd", x[2], K.SAK_4_1_A));
    if (alle) {
      status = "unntatt";
      F("Ledninger i grunnen", "ukjent", "Bygningen må ikke plasseres over ledninger i grunnen. Sjekk kommunens ledningskart før du graver.", K.SAK_4_1_A);
    } else if (areal <= G.fri_uten_ansvar_m2 && (inn.etasjer || 1) <= 1 && !inn.beboelse) {
      status = "selv";
      F("Spor: søknad uten ansvarsrett", "ok", `Frittliggende bygning på inntil ${G.fri_uten_ansvar_m2} m² i én etasje. Du kan søke selv.`, K.SAK_3_1_B);
    } else {
      F("Spor: krever ansvarlig søker", "ok", `Over ${G.fri_uten_ansvar_m2} m², flere etasjer eller til beboelse.`, K.PBL_20_3);
    }
  } else if (inn.type === "tilbygg") {
    const v = [
      [`Areal ≤ ${G.tilbygg_m2} m² (BRA og BYA)`, areal <= G.tilbygg_m2, `Oppgitt ${nf(areal)} m².`],
      ["Understøttet", inn.understottet !== false, "Tilbygget må være understøttet, ikke utkraget."],
      [`Maks ${G.tilbygg_etasjer} etasjer`, (inn.etasjer || 1) <= G.tilbygg_etasjer, `Oppgitt ${inn.etasjer || 1}.`],
      ["Ingen ny boenhet", !(inn.nyeBoenheter > 0), "Ny boenhet er alltid søknadspliktig med ansvarlig søker."]
    ];
    const krav = Math.max(G.pbl_avstand, inn.minAvstand || 0);
    v.push([`Minst ${nf(krav)} m fra nabogrense`, (inn.avstandNabo != null && inn.avstandNabo >= krav) || inn.naboSamtykke, `Målt ${m(inn.avstandNabo, 2)}.`]);
    const alle = v.every(x => x[1]);
    v.forEach(x => F(`Unntak: ${x[0]}`, x[1] ? "ok" : "brudd", x[2], K.SAK_4_1_B));
    if (alle) status = "unntatt";
    else if (areal <= G.tilbygg_uten_ansvar_m2 && !(inn.nyeBoenheter > 0)) {
      status = "selv";
      F("Spor: søknad uten ansvarsrett", "ok", `Ett enkelt tilbygg på inntil ${G.tilbygg_uten_ansvar_m2} m². Du kan søke selv.`, K.SAK_3_1_A);
    } else F("Spor: krever ansvarlig søker", "ok", `Over ${G.tilbygg_uten_ansvar_m2} m² eller ny boenhet.`, K.PBL_20_3);
  } else if (inn.type === "terrasse") {
    const v = [
      [`Høyde ≤ ${nf(G.terrasse_hoyde)} m over terreng`, inn.hoyde != null && inn.hoyde <= G.terrasse_hoyde, `Oppgitt ${m(inn.hoyde)}.`],
      [`Stikker ≤ ${nf(G.terrasse_utstikk)} m ut fra fasadeliv`, inn.utstikk != null && inn.utstikk <= G.terrasse_utstikk, `Oppgitt ${m(inn.utstikk)}.`],
      ["Minst 1,0 m fra nabogrense", inn.avstandNabo != null && inn.avstandNabo >= 1.0, `Målt ${m(inn.avstandNabo, 2)}.`],
      ["Ikke overbygd", !inn.overbygd, inn.overbygd ? "Overbygd terrasse er ikke omfattet av unntaket." : "Oppgitt uten tak."]
    ];
    const alle = v.every(x => x[1]);
    v.forEach(x => F(`Unntak: ${x[0]}`, x[1] ? "ok" : "brudd", x[2], K.SAK_4_1_D));
    status = alle ? "unntatt" : "selv";
    if (!alle) F("Spor: søknad uten ansvarsrett", "ok", "Terrassen faller utenfor unntaket, men er et mindre tiltak du normalt kan søke om selv.", K.SAK_3_1_A);
  } else if (inn.type === "levegg") {
    const h = inn.hoyde, l = inn.lengde, a = inn.avstandNabo;
    const ok = h != null && l != null && h <= G.levegg_hoyde && ((l <= G.levegg_lengde && a != null && a >= 1.0) || l <= G.levegg_lengde_grense);
    F("Unntak: levegg", ok ? "ok" : "brudd", `Høyde ${m(h)}, lengde ${m(l)}, avstand til nabogrense ${m(a, 2)}. Inntil 1,8 m høy og 10 m lang krever 1 m avstand. Inntil 5 m lang kan stå i grensa.`, K.SAK_4_1_LEVEGG);
    status = ok ? "unntatt" : "selv";
  } else if (inn.type === "mur") {
    const h = inn.hoyde, a = inn.avstandNabo;
    const ok = h != null && a != null && ((h <= G.mur_hoyde_1m && a >= 1.0) || (h <= G.mur_hoyde_4m && a >= 4.0));
    F("Unntak: forstøtningsmur", ok ? "ok" : "brudd", `Høyde ${m(h)}, avstand ${m(a, 2)}. Inntil 1,0 m krever 1 m avstand, inntil 1,5 m krever 4 m.`, K.SAK_4_1_MUR);
    F("Frisikt mot veg", "ukjent", "Muren må ikke hindre sikten i frisiktsoner mot veg.", K.SAK_4_1_MUR);
    status = ok ? "unntatt" : ((h || 0) <= 1.5 ? "selv" : "ansvarlig");
  }

  /* --- pbl § 29-4 avstand og høyde --- */
  if (bygningstiltak) {
    const a = inn.avstandNabo;
    const krav = Math.max(inn.minAvstand || G.pbl_avstand, (inn.mone || 0) / 2);
    if (a == null) F("Avstand til nabogrense (pbl)", "ukjent", `Hovedregel: minst ${m(krav)}. Plasser bygget i kartet for å måle.`, K.PBL_29_4_AVSTAND);
    else if (a >= krav) F("Avstand til nabogrense (pbl)", "ok", `${m(a, 2)} er minst ${m(krav)}.`, K.PBL_29_4_AVSTAND);
    else if (inn.type === "garasje" && erMindreTiltak294(inn.bya, inn.bra, inn.gesims, inn.mone) && a >= 1.0)
      F("Avstand til nabogrense (pbl)", "ok", `${m(a, 2)} er under 4 m, men frittliggende garasje eller uthus under 50 m² regnes som mindre tiltak og kan godkjennes ned til 1 m.`, K.PBL_29_4_UNNTAK);
    else if (inn.naboSamtykke) F("Avstand til nabogrense (pbl)", "ok", `${m(a, 2)} er under ${m(krav)}, men du har skriftlig nabosamtykke. Legg det ved søknaden.`, K.PBL_29_4_UNNTAK);
    else { F("Avstand til nabogrense (pbl)", "brudd", `${m(a, 2)} er under ${m(krav)}. Du trenger skriftlig nabosamtykke eller dispensasjon.`, K.PBL_29_4_AVSTAND); pblBrudd = true; }

    if ((inn.gesims != null && inn.gesims > G.pbl_gesims) || (inn.mone != null && inn.mone > G.pbl_mone)) {
      F("Maks høyde uten planhjemmel", "brudd", `Gesims ${m(inn.gesims)} og møne ${m(inn.mone)} overstiger 8 og 9 m. Det krever uttrykkelig hjemmel i plan.`, K.PBL_29_4_HOYDE);
      pblBrudd = true;
    }
  }

  /* --- Vegloven --- */
  if (bygningstiltak) {
    const d = inn.avstandVeg, vt = (inn.vegtype || "").toLowerCase();
    if (d == null || !vt) F("Byggegrense mot veg", "ukjent", "Oppgi avstand til vegmidte og vegtype. Reguleringsplan kan ha egen byggegrense som går foran vegloven.", K.VEGL_29);
    else if (vt === "privat") F("Byggegrense mot veg", "ok", "Privat veg. Vegloven § 29 gjelder ikke, men sjekk planens byggegrense.", K.VEGL_29);
    else {
      const kv = vt === "kommunal" ? G.veg_kommunal : G.veg_riks;
      if (d >= kv) F("Byggegrense mot veg", "ok", `${m(d)} er minst ${m(kv)} fra midtlinja på ${vt} veg.`, K.VEGL_29);
      else F("Byggegrense mot veg", "ukjent", `${m(d)} er under ${m(kv)} fra midtlinja på ${vt} veg. Dette gjelder bare hvis planen ikke har egen byggegrense. Ellers trengs dispensasjon fra vegmyndigheten.`, K.VEGL_29);
    }
  }

  /* --- Brannavstand --- */
  if (bygningstiltak && inn.avstandBygg != null && inn.avstandBygg < G.brann)
    F("Brannavstand til annen bygning", "ukjent", `${m(inn.avstandBygg, 2)} er under 8 m. Veggen mot nabobygningen må normalt utføres brannskillende (EI 30), eller avstanden må økes.`, K.TEK_11_6);

  /* --- Naturfare fra NVE --- */
  if (inn.farer && inn.farer.length)
    F("Naturfare (NVE)", "ukjent", `Tomta ligger innenfor aktsomhetsområde for ${inn.farer.join(", ")}. Kommunen vil kreve dokumentert sikkerhet. Dette gjelder også tiltak som ellers er unntatt søknadsplikt.`, K.TEK_7_1);

  /* --- Samlet status --- */
  let samlet = status;
  if (planBrudd || pblBrudd) samlet = "dispensasjon";

  return {
    status: samlet, grunnstatus: status, funn,
    dokumentkrav: dokumentkrav(samlet, status),
    nesteSteg: nesteSteg(samlet, funn),
    plan: sett ? { navn: sett.navn, dok: sett.dok, url: sett.url, vedtatt: sett.vedtatt } : null,
    forbehold: forbehold(sett, sone, inn)
  };
}

const STATUSTEKST = {
  utenfor: { tittel: "Denne tjenesten gjelder ikke her", niva: "bad", under: "Plan- og bygningsloven gjelder ikke på Svalbard og Jan Mayen. Der er det andre regler og en annen myndighet." },
  unntatt: { tittel: "Ser ut til at du kan bygge uten å søke", niva: "ok", under: "Tiltaket oppfyller vilkårene i byggesaksforskriften § 4-1, forutsatt at planen for tomta ikke sier noe annet." },
  selv: { tittel: "Søknadspliktig, men du kan søke selv", niva: "warn", under: "Du kan sende søknaden uten ansvarlig søker etter byggesaksforskriften § 3-1. Nabovarsel må sendes først." },
  ansvarlig: { tittel: "Søknadspliktig, krever ansvarlig søker", niva: "warn", under: "Tiltaket er for stort til å søke selv. Du trenger et foretak som ansvarlig søker etter plan- og bygningsloven § 20-3." },
  dispensasjon: { tittel: "Søknadspliktig, og du trenger trolig dispensasjon", niva: "bad", under: "Ett eller flere krav i planen eller loven er brutt. Se hva som må løses under." }
};

function dokumentkrav(status, grunn) {
  if (status === "unntatt") return [
    "Ingen søknad. Meld fra til kommunen senest fire uker etter at det er ferdig: dato, matrikkelnummer, kart med plassering, areal, bygningstype og bruksformål.",
    "Ta vare på en målsatt skisse av plasseringen, med avstand til nabogrense og veg, i tilfelle tilsyn."
  ];
  const k = [
    "Søknadsskjema via kommunens digitale løsning eller blankett " + (grunn === "selv" ? "5153 (uten ansvarsrett)" : "5174 (med ansvarsrett)") + ".",
    "Situasjonsplan i målestokk med tiltaket inntegnet, og avstander til nabogrense, veg og andre bygg.",
    "Plan-, snitt- og fasadetegninger med høyder på gesims og møne, og terrenglinjer.",
    "Nabovarsel til naboer og gjenboere med kvittering, blankett 5154, 5155 og 5156.",
    "Redegjørelse for grad av utnytting før og etter tiltaket, inkludert parkering."
  ];
  if (grunn === "ansvarlig" || status === "dispensasjon") k.push("Gjennomføringsplan og erklæringer om ansvarsrett, dersom tiltaket krever ansvarlige foretak.");
  if (status === "dispensasjon") k.push("Egen søknad om dispensasjon med begrunnelse etter plan- og bygningsloven § 19-1. Naboene må varsles særskilt om dispensasjonen.");
  return k;
}

function nesteSteg(status, funn) {
  const steg = [];
  funn.filter(f => f.utfall === "brudd").forEach(f => steg.push(`Løs: ${f.regel}. ${f.forklaring}`));
  funn.filter(f => f.utfall === "ukjent").forEach(f => steg.push(`Avklar: ${f.regel}. ${f.forklaring}`));
  if (status === "unntatt") steg.push("Bygg. Send melding til kommunen innen fire uker etter at det er ferdig.");
  else if (status === "selv") steg.push("Send nabovarsel, vent 14 dager, og send søknaden. Kommunens frist er 3 uker når det ikke er merknader eller dispensasjon.");
  else if (status === "ansvarlig") steg.push("Engasjer en ansvarlig søker, altså arkitekt eller byggmester med sentral godkjenning. Kommunens frist er 12 uker.");
  else if (status === "dispensasjon") steg.push("Vurder å justere tiltaket så det følger planen. Det er raskere og billigere enn dispensasjon. Ellers: dispensasjonssøknad med 12 ukers frist.");
  return steg;
}

function forbehold(sett, sone, inn) {
  const f = [];
  if (sett && !sone) f.push(`Sone i ${sett.navn} er ikke valgt, så utnytting, uteoppholdsareal og parkering er ikke sjekket mot planen.`);
  if (!sett) f.push("Vi leser ikke planbestemmelsene automatisk i denne kommunen ennå. Maks utnyttelse og avstandskrav er det du selv har skrevet inn.");
  f.push("Gjeldende reguleringsplan for eiendommen er ikke lest ordrett. En eldre reguleringsplan kan ha egne bestemmelser om byggegrense, takform og høyde.");
  if (!inn.farer || !inn.farer.length) f.push("Kulturminner, støy og ledninger i grunnen er ikke sjekket.");
  f.push("Eiendomsgrenser fra Kartverket kan avvike fra den faktiske grensa, særlig på eldre tomter. Målene her er veiledende.");
  f.push("Dette er en regelbasert forhåndsvurdering med kildehenvisninger. Det er ikke et vedtak og ikke juridisk rådgivning. Kommunen avgjør.");
  return f;
}
