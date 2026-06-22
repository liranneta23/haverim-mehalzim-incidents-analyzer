export interface Coords { lat: number; lng: number }

// ─────────────────────────────────────────────────────────────────────────────
// CITY / LOCATION MAP  (location_mkmbv7be → coords)
//
// Two kinds of entries:
//   1. Clean canonical city names — easy for a human to extend.
//   2. Exact Monday.com location strings — the lookup is full-string so every
//      variant stored in the board needs its own entry.
//
// Lookup is case-insensitive (see getCoordinates).
// ─────────────────────────────────────────────────────────────────────────────

export const COORDINATE_MAP: Record<string, Coords> = {

  // ── Israel ──────────────────────────────────────────────────────────────────
  'Tel Aviv':          { lat:  32.0853, lng:  34.7818 },
  'Jerusalem':         { lat:  31.7683, lng:  35.2137 },
  'Haifa':             { lat:  32.7940, lng:  34.9896 },
  'Beer Sheva':        { lat:  31.2530, lng:  34.7915 },
  'Eilat':             { lat:  29.5581, lng:  34.9482 },

  // ── North America ───────────────────────────────────────────────────────────
  'New York':          { lat:  40.7128, lng:  -74.0060 },
  'Los Angeles':       { lat:  34.0522, lng: -118.2437 },
  'Chicago':           { lat:  41.8781, lng:  -87.6298 },
  'Miami':             { lat:  25.7617, lng:  -80.1918 },
  'Houston':           { lat:  29.7604, lng:  -95.3698 },
  'New Orleans':       { lat:  29.9511, lng:  -90.0715 },
  'Toronto':           { lat:  43.6532, lng:  -79.3832 },
  'Montreal':          { lat:  45.5017, lng:  -73.5673 },
  'Vancouver':         { lat:  49.2827, lng: -123.1207 },
  'Whistler':          { lat:  50.1163, lng: -122.9574 },
  'Mexico City':       { lat:  19.4326, lng:  -99.1332 },
  'Cancún':            { lat:  21.1619, lng:  -86.8515 },
  'Holbox':            { lat:  21.5233, lng:  -87.3796 },

  // ── South America ───────────────────────────────────────────────────────────
  'Buenos Aires':      { lat: -34.6037, lng:  -58.3816 },
  'São Paulo':         { lat: -23.5505, lng:  -46.6333 },
  'Rio de Janeiro':    { lat: -22.9068, lng:  -43.1729 },
  'Santiago':          { lat: -33.4489, lng:  -70.6693 },
  'Lima':              { lat: -12.0464, lng:  -77.0428 },
  'Guayaquil':         { lat:  -2.1894, lng:  -79.8891 },

  // ── Europe ──────────────────────────────────────────────────────────────────
  'London':            { lat:  51.5074, lng:   -0.1278 },
  'Paris':             { lat:  48.8566, lng:    2.3522 },
  'Berlin':            { lat:  52.5200, lng:   13.4050 },
  'Amsterdam':         { lat:  52.3676, lng:    4.9041 },
  'Brussels':          { lat:  50.8503, lng:    4.3517 },
  'Madrid':            { lat:  40.4168, lng:   -3.7038 },
  'Barcelona':         { lat:  41.3851, lng:    2.1734 },
  'Rome':              { lat:  41.9028, lng:   12.4964 },
  'Milan':             { lat:  45.4654, lng:    9.1859 },
  'Vienna':            { lat:  48.2082, lng:   16.3738 },
  'Innsbruck':         { lat:  47.2692, lng:   11.4041 },
  'Zurich':            { lat:  47.3769, lng:    8.5417 },
  'Geneva':            { lat:  46.2044, lng:    6.1432 },
  'Crans-Montana':     { lat:  46.3120, lng:    7.4787 },
  'Stockholm':         { lat:  59.3293, lng:   18.0686 },
  'Oslo':              { lat:  59.9139, lng:   10.7522 },
  'Copenhagen':        { lat:  55.6761, lng:   12.5683 },
  'Warsaw':            { lat:  52.2297, lng:   21.0122 },
  'Budapest':          { lat:  47.4979, lng:   19.0402 },
  'Prague':            { lat:  50.0755, lng:   14.4378 },
  'Plovdiv':           { lat:  42.1354, lng:   24.7453 },
  'Bucharest':         { lat:  44.4268, lng:   26.1025 },
  'Athens':            { lat:  37.9838, lng:   23.7275 },
  'Thessaloniki':      { lat:  40.6401, lng:   22.9444 },
  'Kavousi':           { lat:  35.1369, lng:   25.8545 },
  'Kyiv':              { lat:  50.4501, lng:   30.5234 },
  'Moscow':            { lat:  55.7558, lng:   37.6173 },
  'Sochi':             { lat:  43.6028, lng:   39.7342 },
  'Minsk':             { lat:  53.9045, lng:   27.5615 },
  'Porto':             { lat:  41.1579, lng:   -8.6291 },
  'Larnaca':           { lat:  34.9229, lng:   33.6233 },
  'Paphos':            { lat:  34.7757, lng:   32.4228 },

  // ── Middle East & Africa ────────────────────────────────────────────────────
  'Istanbul':          { lat:  41.0082, lng:   28.9784 },
  'Tbilisi':           { lat:  41.6941, lng:   44.8337 },
  'Batumi':            { lat:  41.6475, lng:   41.6417 },
  'Dubai':             { lat:  25.2048, lng:   55.2708 },
  'Abu Dhabi':         { lat:  24.4539, lng:   54.3773 },
  'Amman':             { lat:  31.9454, lng:   35.9284 },
  'Cairo':             { lat:  30.0444, lng:   31.2357 },
  'Dahab':             { lat:  28.4888, lng:   34.5120 },
  'Casablanca':        { lat:  33.5731, lng:   -7.5898 },
  'Johannesburg':      { lat: -26.2041, lng:   28.0473 },
  'Cape Town':         { lat: -33.9249, lng:   18.4241 },
  'Nairobi':           { lat:  -1.2921, lng:   36.8219 },
  'Addis Ababa':       { lat:   9.0320, lng:   38.7469 },
  'Lagos':             { lat:   6.5244, lng:    3.3792 },
  'Gisenyi':           { lat:  -1.7027, lng:   29.2563 },

  // ── Asia — South / Southeast ────────────────────────────────────────────────
  'Mumbai':            { lat:  19.0760, lng:   72.8777 },
  'Goa':               { lat:  15.2993, lng:   74.1240 },
  'Pushkar':           { lat:  26.4890, lng:   74.5510 },
  'Dharamshala':       { lat:  32.2190, lng:   76.3234 },
  'Kasol':             { lat:  32.0090, lng:   77.3137 },
  'Leh':               { lat:  34.1526, lng:   77.5771 },
  'Pulga':             { lat:  32.0548, lng:   77.5230 },
  'Kathmandu':         { lat:  27.7172, lng:   85.3240 },
  'Colombo':           { lat:   6.9271, lng:   79.8612 },
  'Galle':             { lat:   6.0535, lng:   80.2210 },
  'Weligama':          { lat:   5.9764, lng:   80.4291 },
  'Ahangama':          { lat:   5.9818, lng:   80.3611 },
  'Nawalapitiya':      { lat:   7.0546, lng:   80.5314 },
  'Port Blair':        { lat:  11.6234, lng:   92.7265 },
  'Bangkok':           { lat:  13.7563, lng:  100.5018 },
  'Koh Samui':         { lat:   9.5120, lng:  100.0136 },
  'Koh Phangan':       { lat:   9.7380, lng:  100.0136 },
  'Koh Tao':           { lat:  10.0956, lng:   99.8434 },
  'Ko Phi Phi':        { lat:   7.7407, lng:   98.7784 },
  'Phuket':            { lat:   7.9519, lng:   98.3381 },
  'Pattaya':           { lat:  12.9275, lng:  100.8769 },
  'Chiang Mai':        { lat:  18.7883, lng:   98.9853 },
  'Pai':               { lat:  19.3583, lng:   98.4419 },
  'Mae Hong Son':      { lat:  19.3011, lng:   97.9679 },
  'Khao Sok':          { lat:   8.9067, lng:   98.5273 },
  'Hanoi':             { lat:  21.0285, lng:  105.8542 },
  'Da Nang':           { lat:  16.0544, lng:  108.2022 },
  'Sa Pa':             { lat:  22.3363, lng:  103.8438 },
  'Ho Chi Minh City':  { lat:  10.8231, lng:  106.6297 },
  'Vang Vieng':        { lat:  18.9225, lng:  102.4454 },
  'Luang Prabang':     { lat:  19.8845, lng:  102.1348 },
  'Thakhek':           { lat:  17.4069, lng:  104.8330 },
  'Phnom Penh':        { lat:  11.5564, lng:  104.9282 },
  'Koh Rong':          { lat:  10.7242, lng:  103.2413 },
  'Manila':            { lat:  14.5995, lng:  120.9842 },
  'Siargao':           { lat:   9.8482, lng:  126.0458 },
  'El Nido':           { lat:  11.1839, lng:  119.3934 },
  'Palawan':           { lat:   9.8349, lng:  118.7384 },
  'Puerto Princesa':   { lat:   9.7392, lng:  118.7353 },
  'Mandaue':           { lat:  10.3236, lng:  123.9223 },
  'Bali':              { lat:  -8.3405, lng:  115.0920 },
  'Lima (Costa Rica)': { lat:   9.9877, lng:  -83.0356 },

  // ── Asia — East ─────────────────────────────────────────────────────────────
  'Tokyo':             { lat:  35.6762, lng:  139.6503 },
  'Hakuba':            { lat:  36.6979, lng:  137.8569 },
  'Seoul':             { lat:  37.5665, lng:  126.9780 },
  'Singapore':         { lat:   1.3521, lng:  103.8198 },

  // ── Oceania ─────────────────────────────────────────────────────────────────
  'Sydney':            { lat: -33.8688, lng:  151.2093 },
  'Melbourne':         { lat: -37.8136, lng:  144.9631 },
  'Perth':             { lat: -31.9505, lng:  115.8605 },
  'Broome':            { lat: -17.9619, lng:  122.2361 },

  // ─────────────────────────────────────────────────────────────────────────
  // EXACT MONDAY.COM LOCATION STRINGS
  // These match the full text stored in location_mkmbv7be.
  // Add new board entries here as they appear.
  // ─────────────────────────────────────────────────────────────────────────

  // Africa
  'Addis Ababa, Ethiopia':                                                   { lat:   9.0320, lng:   38.7469 },
  'Gisenyi, Rwanda':                                                          { lat:  -1.7027, lng:   29.2563 },
  'Johannesburg, South Africa':                                               { lat: -26.2041, lng:   28.0473 },
  'Karange Kamp, Tanzania':                                                   { lat:  -3.0674, lng:   37.3556 },
  'Sinai Peninsula, Taba, Egypt':                                             { lat:  29.5034, lng:   34.9024 },
  'Dahab, Egypt':                                                             { lat:  28.4888, lng:   34.5120 },

  // North America
  'Alaska, USA':                                                              { lat:  64.2008, lng: -153.4937 },
  'Alberta, Canada':                                                          { lat:  53.9333, lng: -116.5765 },
  'Brooklyn, NY, USA':                                                        { lat:  40.6501, lng:  -73.9496 },
  'Houston, TX, USA':                                                         { lat:  29.7604, lng:  -95.3698 },
  'Whistler, BC, Canada':                                                     { lat:  50.1163, lng: -122.9574 },

  // South America
  'Buenos Aires, Argentina':                                                  { lat: -34.6037, lng:  -58.3816 },
  'Guayaquil, Ecuador':                                                       { lat:  -2.1894, lng:  -79.8891 },
  'Lima, Peru':                                                               { lat: -12.0464, lng:  -77.0428 },
  'Laguna Torres del Rhino o Laguna Azul, Ushuaia, Tierra del Fuego Province, Argentina': { lat: -54.8019, lng: -68.3030 },
  'Rio de Janeiro, State of Rio de Janeiro, Brazil':                          { lat: -22.9068, lng:  -43.1729 },

  // Europe
  'Athens, Greece':                                                           { lat:  37.9838, lng:   23.7275 },
  'Berlin, Germany':                                                          { lat:  52.5200, lng:   13.4050 },
  'Bucarest, Romania':                                                        { lat:  44.4268, lng:   26.1025 },
  'Budapest, Hungary':                                                        { lat:  47.4979, lng:   19.0402 },
  'Copenhagen, Denmark':                                                      { lat:  55.6761, lng:   12.5683 },
  'Crans-Montana, Switzerland':                                               { lat:  46.3120, lng:    7.4787 },
  'Crete, Greece':                                                            { lat:  35.2401, lng:   24.8093 },
  'Geneva, Switzerland':                                                      { lat:  46.2044, lng:    6.1432 },
  'Kavousi, Greece':                                                          { lat:  35.1369, lng:   25.8545 },
  'Lapland, Finland':                                                         { lat:  67.9222, lng:   26.5046 },
  'Madrid, Spain':                                                            { lat:  40.4168, lng:   -3.7038 },
  'Minsk, Minsk Region, Belarus':                                             { lat:  53.9045, lng:   27.5615 },
  'Olympus, Greece':                                                          { lat:  40.0857, lng:   22.3584 },
  'Plovdiv, Bulgaria':                                                        { lat:  42.1354, lng:   24.7453 },
  'Porto, Portugal':                                                          { lat:  41.1579, lng:   -8.6291 },
  'Prague, Czechia':                                                          { lat:  50.0755, lng:   14.4378 },
  'Razlog, Bulgaria':                                                         { lat:  41.8878, lng:   23.4689 },
  'Rome, Italy':                                                              { lat:  41.9028, lng:   12.4964 },
  'Samothrace, Samothraki, Greece':                                           { lat:  40.4700, lng:   25.5450 },
  'Sochi, Russia':                                                            { lat:  43.6028, lng:   39.7342 },
  'Thessaloniki, Greece':                                                     { lat:  40.6401, lng:   22.9444 },
  'Tokyo, Japan':                                                             { lat:  35.6762, lng:  139.6503 },

  // Middle East
  'Dubai - United Arab Emirates':                                             { lat:  25.2048, lng:   55.2708 },
  'Batumi, Georgia':                                                          { lat:  41.6475, lng:   41.6417 },
  'Tibélési, Georgia':                                                        { lat:  41.6941, lng:   44.8337 },

  // South / Southeast Asia
  'Bali, Indonesia':                                                          { lat:  -8.3405, lng:  115.0920 },

  'El Nido, Palawan, Philippines':                                            { lat:  11.1839, lng:  119.3934 },
  'Galle, Sri Lanka':                                                         { lat:   6.0535, lng:   80.2210 },
  'Goa, India':                                                               { lat:  15.2993, lng:   74.1240 },
  'Himachal Pradesh, India':                                                  { lat:  31.1048, lng:   77.1734 },
  'Holalu, Karnataka 583217, India':                                          { lat:  14.0860, lng:   75.5710 },
  'Kasol, Himachal Pradesh, India':                                           { lat:  32.0090, lng:   77.3137 },
  'Kathmandu, Nepal':                                                         { lat:  27.7172, lng:   85.3240 },
  'Khao Sok National Park, Amphoe Phanom, Chang Wat Surat Thani, Thailand':  { lat:   8.9067, lng:   98.5273 },
  'Koh Phangan, Ko Pha-ngan District, Surat Thani, Thailand':                { lat:   9.7380, lng:  100.0136 },
  'Koh Rong, Preah Sihanouk, Cambodia':                                       { lat:  10.7242, lng:  103.2413 },
  'Koh Samui, Ko Samui District, Surat Thani, Thailand':                     { lat:   9.5120, lng:  100.0136 },
  'Larnaca, Cyprus':                                                          { lat:  34.9229, lng:   33.6233 },
  'Leh, Himachal Pradesh, India':                                             { lat:  34.1526, lng:   77.5771 },
  'Limon, Costa Rica':                                                        { lat:   9.9877, lng:  -83.0356 },
  'Mae Hong Son, Thailand':                                                   { lat:  19.3011, lng:   97.9679 },
  'Mandaue, Philippines':                                                     { lat:  10.3236, lng:  123.9223 },
  'Manila International Airport (MNL), Pasay City, Metro Manila, Philippines': { lat: 14.5086, lng: 121.0194 },
  'Manila, Metro Manila, Philippines':                                        { lat:  14.5995, lng:  120.9842 },
  'Nawalapitiya, Sri Lanka':                                                  { lat:   7.0546, lng:   80.5314 },
  'Pai, Pai District, Mae Hong Son, Thailand':                                { lat:  19.3583, lng:   98.4419 },
  'Pai, Thailand':                                                            { lat:  19.3583, lng:   98.4419 },
  'Palawan, Philippines':                                                     { lat:   9.8349, lng:  118.7384 },
  'Paphos, Cyprus':                                                           { lat:  34.7757, lng:   32.4228 },
  'Pattaya Beach, Chon Buri, Thailand':                                       { lat:  12.9275, lng:  100.8769 },
  'Pattaya, Bang Lamung District, Chon Buri, Thailand':                      { lat:  12.9275, lng:  100.8769 },
  'Perth WA, Australia':                                                      { lat: -31.9505, lng:  115.8605 },
  'Puerto Princesa City, Palawan, Philippines':                               { lat:   9.7392, lng:  118.7353 },
  'Pulga, India':                                                             { lat:  32.0548, lng:   77.5230 },
  'Pulga, Sosan, Himachal Pradesh, India':                                    { lat:  32.0548, lng:   77.5230 },
  'Royal Prince Alfred Hospital, Missenden Road, Camperdown Sydney, NSW, Australia': { lat: -33.8900, lng: 151.1875 },
  'Sa Pa, Lao Cai, Vietnam':                                                  { lat:  22.3363, lng:  103.8438 },
  'Samdo, Samagaun, Nepal':                                                   { lat:  28.5693, lng:   84.5864 },
  'Siargao Island, Philippines':                                              { lat:   9.8482, lng:  126.0458 },
  'Sri Vijaya Puram, Andaman and Nicobar Islands, India':                     { lat:  11.6234, lng:   92.7265 },
  'Thakhek, Laos':                                                            { lat:  17.4069, lng:  104.8330 },
  'Thaleku, Chame, Nepal':                                                    { lat:  28.5625, lng:   84.2354 },
  'Tilche 33500, Nepal':                                                      { lat:  28.7375, lng:   83.9506 },
  'Weligama, Sri Lanka':                                                      { lat:   5.9764, lng:   80.4291 },
  'Chiang Mai, Thailand':                                                     { lat:  18.7883, lng:   98.9853 },
  'Bangkok, Thailand':                                                        { lat:  13.7563, lng:  100.5018 },
  'Da Nang, Vietnam':                                                         { lat:  16.0544, lng:  108.2022 },
  'Hanoi, Vietnam':                                                           { lat:  21.0285, lng:  105.8542 },

  // ── Hebrew location strings (location_mkmbv7be stored in Hebrew) ─────────────
  'אבו דאבי - Abu Dhabi - United Arab Emirates':                             { lat:  24.4539, lng:   54.3773 },
  'אהנגמה, Sri Lanka':                                                        { lat:   5.9818, lng:   80.3611 },
  'אהנגאמה, Sri Lanka':                                                       { lat:   5.9818, lng:   80.3611 },
  'אינסברוק, Austria':                                                        { lat:  47.2692, lng:   11.4041 },
  'איסטנבול, İstanbul, Türkiye':                                             { lat:  41.0082, lng:   28.9784 },
  'אמסטרדם, Netherlands':                                                     { lat:  52.3676, lng:    4.9041 },
  'ברום WA, Australia':                                                       { lat: -17.9619, lng:  122.2361 },
  'גואה, India':                                                              { lat:  15.2993, lng:   74.1240 },
  'דרום אמריקה':                                                             { lat: -14.2350, lng:  -51.9253 },
  'דרמסאלה, Himachal Pradesh, India':                                         { lat:  32.2190, lng:   76.3234 },
  'האקובה, Nagano, Japan':                                                    { lat:  36.6979, lng:  137.8569 },
  'הולבוש, Mexico':                                                           { lat:  21.5233, lng:  -87.3796 },
  'ואנג וייניג, Laos':                                                        { lat:  18.9225, lng:  102.4454 },
  'ואנג ויינג, Laos':                                                         { lat:  18.9225, lng:  102.4454 },
  'טוקיו, Japan':                                                             { lat:  35.6762, lng:  139.6503 },
  'יוטה, USA':                                                                { lat:  39.3210, lng: -111.0937 },
  'לואנג פרבאנג, Laos':                                                       { lat:  19.8845, lng:  102.1348 },
  'לונדון, UK':                                                               { lat:  51.5074, lng:   -0.1278 },
  'מקסיקו סיטי, Mexico':                                                      { lat:  19.4326, lng:  -99.1332 },
  'ניו אורלינס, LA, USA':                                                     { lat:  29.9511, lng:  -90.0715 },
  'ניו יורק, NY, USA':                                                        { lat:  40.7128, lng:  -74.0060 },
  'נפאל':                                                                     { lat:  28.3949, lng:   84.1240 },
  'סאו פאולו, São Paulo - State of São Paulo, Brazil':                        { lat: -23.5505, lng:  -46.6333 },
  'פאי, Pai District, Mae Hong Son, Thailand':                                { lat:  19.3583, lng:   98.4419 },
  'פוקט, Mueang Phuket District, Phuket, Thailand':                           { lat:   7.9519, lng:   98.3381 },
  'פוקט, Thailand':                                                           { lat:   7.9519, lng:   98.3381 },
  'פושקר, Rajasthan, India':                                                  { lat:  26.4890, lng:   74.5510 },
  'פנום פן, Cambodia':                                                        { lat:  11.5564, lng:  104.9282 },
  "צ'יאנג מאי, Mueang Chiang Mai District, Chiang Mai, Thailand":            { lat:  18.7883, lng:   98.9853 },
  'קו טאו, Thailand':                                                         { lat:  10.0956, lng:   99.8434 },
  'קו סמוי, Ko Samui District, Surat Thani, Thailand':                       { lat:   9.5120, lng:  100.0136 },
  'קו פה נגאן, Ko Pha-ngan District, Surat Thani, Thailand':                 { lat:   9.7380, lng:  100.0136 },
  'קו פי פי, Mueang Krabi District, Krabi, Thailand':                        { lat:   7.7407, lng:   98.7784 },
  'קנקון, Quintana Roo, Mexico':                                              { lat:  21.1619, lng:  -86.8515 },
  'שירגאו':                                                                   { lat:   9.8482, lng:  126.0458 },
};

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY FALLBACK MAP  (country_mkmb91h3 → geographic centroid)
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTRY_MAP: Record<string, Coords> = {
  'Israel':                 { lat:  31.0461, lng:   34.8516 },
  'United States':          { lat:  37.0902, lng:  -95.7129 },
  'USA':                    { lat:  37.0902, lng:  -95.7129 },
  'United Kingdom':         { lat:  55.3781, lng:   -3.4360 },
  'UK':                     { lat:  55.3781, lng:   -3.4360 },
  'France':                 { lat:  46.2276, lng:    2.2137 },
  'Germany':                { lat:  51.1657, lng:   10.4515 },
  'Netherlands':            { lat:  52.1326, lng:    5.2913 },
  'Belgium':                { lat:  50.5039, lng:    4.4699 },
  'Spain':                  { lat:  40.4637, lng:   -3.7492 },
  'Italy':                  { lat:  41.8719, lng:   12.5674 },
  'Austria':                { lat:  47.5162, lng:   14.5501 },
  'Switzerland':            { lat:  46.8182, lng:    8.2275 },
  'Sweden':                 { lat:  60.1282, lng:   18.6435 },
  'Norway':                 { lat:  60.4720, lng:    8.4689 },
  'Denmark':                { lat:  56.2639, lng:    9.5018 },
  'Finland':                { lat:  61.9241, lng:   25.7482 },
  'Poland':                 { lat:  51.9194, lng:   19.1451 },
  'Hungary':                { lat:  47.1625, lng:   19.5033 },
  'Czech Republic':         { lat:  49.8175, lng:   15.4730 },
  'Romania':                { lat:  45.9432, lng:   24.9668 },
  'Bulgaria':               { lat:  42.7339, lng:   25.4858 },
  'Greece':                 { lat:  39.0742, lng:   21.8243 },
  'Ukraine':                { lat:  48.3794, lng:   31.1656 },
  'Russia':                 { lat:  61.5240, lng:  105.3188 },
  'Belarus':                { lat:  53.7098, lng:   27.9534 },
  'Portugal':               { lat:  39.3999, lng:   -8.2245 },
  'Cyprus':                 { lat:  35.1264, lng:   33.4299 },
  'Turkey':                 { lat:  38.9637, lng:   35.2433 },
  'UAE':                    { lat:  23.4241, lng:   53.8478 },
  'United Arab Emirates':   { lat:  23.4241, lng:   53.8478 },
  'Georgia':                { lat:  42.3154, lng:   43.3569 },
  'Jordan':                 { lat:  30.5852, lng:   36.2384 },
  'Egypt':                  { lat:  26.8206, lng:   30.8025 },
  'Morocco':                { lat:  31.7917, lng:   -7.0926 },
  'Ethiopia':               { lat:   9.1450, lng:   40.4897 },
  'Rwanda':                 { lat:  -1.9403, lng:   29.8739 },
  'Tanzania':               { lat:  -6.3690, lng:   34.8888 },
  'South Africa':           { lat: -30.5595, lng:   22.9375 },
  'Kenya':                  { lat:  -0.0236, lng:   37.9062 },
  'Nigeria':                { lat:   9.0820, lng:    8.6753 },
  'India':                  { lat:  20.5937, lng:   78.9629 },
  'Nepal':                  { lat:  28.3949, lng:   84.1240 },
  'Sri Lanka':              { lat:   7.8731, lng:   80.7718 },
  'Thailand':               { lat:  15.8700, lng:  100.9925 },
  'Vietnam':                { lat:  14.0583, lng:  108.2772 },
  'Laos':                   { lat:  19.8563, lng:  102.4955 },
  'Cambodia':               { lat:  12.5657, lng:  104.9910 },
  'Indonesia':              { lat:  -0.7893, lng:  113.9213 },
  'Philippines':            { lat:  12.8797, lng:  121.7740 },
  'Japan':                  { lat:  36.2048, lng:  138.2529 },
  'South Korea':            { lat:  35.9078, lng:  127.7669 },
  'Kazakhstan':             { lat:  48.0196, lng:   66.9237 },
  'Singapore':              { lat:   1.3521, lng:  103.8198 },
  'Australia':              { lat: -25.2744, lng:  133.7751 },
  'Canada':                 { lat:  56.1304, lng: -106.3468 },
  'Mexico':                 { lat:  23.6345, lng: -102.5528 },
  'Costa Rica':             { lat:   9.7489, lng:  -83.7534 },
  'Panama':                 { lat:   8.5380, lng:  -80.7821 },
  'Ecuador':                { lat:  -1.8312, lng:  -78.1834 },
  'Peru':                   { lat:  -9.1900, lng:  -75.0152 },
  'Argentina':              { lat: -38.4161, lng:  -63.6167 },
  'Brazil':                 { lat: -14.2350, lng:  -51.9253 },
  'Chile':                  { lat: -35.6751, lng:  -71.5430 },

  // ── Hebrew country aliases (Monday.com stores country names in Hebrew) ────────
  'ישראל':                  { lat:  31.0461, lng:   34.8516 },
  'ארצות הברית':            { lat:  37.0902, lng:  -95.7129 },
  'אמריקה':                 { lat:  37.0902, lng:  -95.7129 },
  'בריטניה':                { lat:  55.3781, lng:   -3.4360 },
  'אנגליה':                 { lat:  51.5074, lng:   -0.1278 },
  'צרפת':                   { lat:  46.2276, lng:    2.2137 },
  'גרמניה':                 { lat:  51.1657, lng:   10.4515 },
  'הולנד':                  { lat:  52.1326, lng:    5.2913 },
  'בלגיה':                  { lat:  50.5039, lng:    4.4699 },
  'ספרד':                   { lat:  40.4637, lng:   -3.7492 },
  'איטליה':                 { lat:  41.8719, lng:   12.5674 },
  'אוסטריה':                { lat:  47.5162, lng:   14.5501 },
  'שוויץ':                  { lat:  46.8182, lng:    8.2275 },
  'שבדיה':                  { lat:  60.1282, lng:   18.6435 },
  'נורווגיה':               { lat:  60.4720, lng:    8.4689 },
  'דנמרק':                  { lat:  56.2639, lng:    9.5018 },
  'פינלנד':                 { lat:  61.9241, lng:   25.7482 },
  'פולין':                  { lat:  51.9194, lng:   19.1451 },
  'הונגריה':                { lat:  47.1625, lng:   19.5033 },
  "צ'כיה":                  { lat:  49.8175, lng:   15.4730 },
  'רומניה':                 { lat:  45.9432, lng:   24.9668 },
  'יוון':                   { lat:  39.0742, lng:   21.8243 },
  'אוקראינה':               { lat:  48.3794, lng:   31.1656 },
  'רוסיה':                  { lat:  61.5240, lng:  105.3188 },
  'טורקיה':                 { lat:  38.9637, lng:   35.2433 },
  'איחוד האמירויות':        { lat:  23.4241, lng:   53.8478 },
  'ירדן':                   { lat:  30.5852, lng:   36.2384 },
  'מצרים':                  { lat:  26.8206, lng:   30.8025 },
  'מרוקו':                  { lat:  31.7917, lng:   -7.0926 },
  'דרום אפריקה':            { lat: -30.5595, lng:   22.9375 },
  'קנדה':                   { lat:  56.1304, lng: -106.3468 },
  'אוסטרליה':               { lat: -25.2744, lng:  133.7751 },
  'ברזיל':                  { lat: -14.2350, lng:  -51.9253 },
  'ארגנטינה':               { lat: -38.4161, lng:  -63.6167 },
  'נפאל':                   { lat:  28.3949, lng:   84.1240 },
  'תאילנד':                 { lat:  15.8700, lng:  100.9925 },
  'הודו':                   { lat:  20.5937, lng:   78.9629 },
  'יפן':                    { lat:  36.2048, lng:  138.2529 },
  'סינגפור':                { lat:   1.3521, lng:  103.8198 },
};

// ─────────────────────────────────────────────────────────────────────────────
// ISO-3166-1 ALPHA-2 → geographic centroid.
// Final, language-independent fallback: Monday's Country column always supplies a
// countryCode (e.g. "MN", "RS"), so any country — including ones never seen
// before — resolves here even if its name is missing from the maps above.
// Covers every assignable ISO-2 code; keys are uppercase.
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTRY_CODE_MAP: Record<string, Coords> = {
  AD: { lat: 42.546, lng: 1.602 },     AE: { lat: 23.424, lng: 53.848 },
  AF: { lat: 33.939, lng: 67.710 },    AG: { lat: 17.061, lng: -61.796 },
  AI: { lat: 18.221, lng: -63.069 },   AL: { lat: 41.153, lng: 20.168 },
  AM: { lat: 40.069, lng: 45.038 },    AO: { lat: -11.203, lng: 17.874 },
  AQ: { lat: -75.251, lng: -0.071 },   AR: { lat: -38.416, lng: -63.617 },
  AS: { lat: -14.271, lng: -170.132 }, AT: { lat: 47.516, lng: 14.550 },
  AU: { lat: -25.274, lng: 133.775 },  AW: { lat: 12.521, lng: -69.968 },
  AX: { lat: 60.179, lng: 19.913 },    AZ: { lat: 40.143, lng: 47.577 },
  BA: { lat: 43.915, lng: 17.679 },    BB: { lat: 13.194, lng: -59.543 },
  BD: { lat: 23.685, lng: 90.356 },    BE: { lat: 50.504, lng: 4.470 },
  BF: { lat: 12.238, lng: -1.562 },    BG: { lat: 42.734, lng: 25.486 },
  BH: { lat: 26.067, lng: 50.555 },    BI: { lat: -3.373, lng: 29.919 },
  BJ: { lat: 9.308, lng: 2.316 },      BL: { lat: 17.900, lng: -62.834 },
  BM: { lat: 32.321, lng: -64.757 },   BN: { lat: 4.535, lng: 114.728 },
  BO: { lat: -16.290, lng: -63.589 },  BQ: { lat: 12.178, lng: -68.239 },
  BR: { lat: -14.235, lng: -51.925 },  BS: { lat: 25.034, lng: -77.396 },
  BT: { lat: 27.514, lng: 90.434 },    BV: { lat: -54.423, lng: 3.413 },
  BW: { lat: -22.328, lng: 24.685 },   BY: { lat: 53.710, lng: 27.954 },
  BZ: { lat: 17.190, lng: -88.498 },   CA: { lat: 56.130, lng: -106.347 },
  CC: { lat: -12.164, lng: 96.871 },   CD: { lat: -4.038, lng: 21.759 },
  CF: { lat: 6.611, lng: 20.939 },     CG: { lat: -0.228, lng: 15.828 },
  CH: { lat: 46.818, lng: 8.228 },     CI: { lat: 7.540, lng: -5.547 },
  CK: { lat: -21.237, lng: -159.778 }, CL: { lat: -35.675, lng: -71.543 },
  CM: { lat: 7.370, lng: 12.355 },     CN: { lat: 35.862, lng: 104.195 },
  CO: { lat: 4.571, lng: -74.297 },    CR: { lat: 9.749, lng: -83.754 },
  CU: { lat: 21.522, lng: -77.781 },   CV: { lat: 16.003, lng: -24.014 },
  CW: { lat: 12.169, lng: -68.990 },   CX: { lat: -10.448, lng: 105.690 },
  CY: { lat: 35.126, lng: 33.430 },    CZ: { lat: 49.818, lng: 15.473 },
  DE: { lat: 51.166, lng: 10.452 },    DJ: { lat: 11.825, lng: 42.590 },
  DK: { lat: 56.264, lng: 9.502 },     DM: { lat: 15.415, lng: -61.371 },
  DO: { lat: 18.736, lng: -70.163 },   DZ: { lat: 28.034, lng: 1.660 },
  EC: { lat: -1.831, lng: -78.183 },   EE: { lat: 58.595, lng: 25.014 },
  EG: { lat: 26.821, lng: 30.803 },    EH: { lat: 24.216, lng: -12.886 },
  ER: { lat: 15.179, lng: 39.782 },    ES: { lat: 40.464, lng: -3.749 },
  ET: { lat: 9.145, lng: 40.490 },     FI: { lat: 61.924, lng: 25.748 },
  FJ: { lat: -17.713, lng: 178.065 },  FK: { lat: -51.796, lng: -59.524 },
  FM: { lat: 7.426, lng: 150.551 },    FO: { lat: 61.893, lng: -6.911 },
  FR: { lat: 46.228, lng: 2.214 },     GA: { lat: -0.804, lng: 11.609 },
  GB: { lat: 55.378, lng: -3.436 },    GD: { lat: 12.117, lng: -61.679 },
  GE: { lat: 42.315, lng: 43.357 },    GF: { lat: 3.934, lng: -53.126 },
  GG: { lat: 49.466, lng: -2.585 },    GH: { lat: 7.946, lng: -1.024 },
  GI: { lat: 36.138, lng: -5.345 },    GL: { lat: 71.707, lng: -42.604 },
  GM: { lat: 13.444, lng: -15.310 },   GN: { lat: 9.945, lng: -9.697 },
  GP: { lat: 16.265, lng: -61.551 },   GQ: { lat: 1.651, lng: 10.268 },
  GR: { lat: 39.074, lng: 21.824 },    GS: { lat: -54.430, lng: -36.588 },
  GT: { lat: 15.783, lng: -90.231 },   GU: { lat: 13.444, lng: 144.794 },
  GW: { lat: 11.804, lng: -15.180 },   GY: { lat: 4.861, lng: -58.930 },
  HK: { lat: 22.320, lng: 114.170 },   HM: { lat: -53.081, lng: 73.504 },
  HN: { lat: 15.200, lng: -86.242 },   HR: { lat: 45.100, lng: 15.200 },
  HT: { lat: 18.971, lng: -72.285 },   HU: { lat: 47.162, lng: 19.503 },
  ID: { lat: -0.789, lng: 113.921 },   IE: { lat: 53.413, lng: -8.244 },
  IL: { lat: 31.046, lng: 34.852 },    IM: { lat: 54.237, lng: -4.548 },
  IN: { lat: 20.594, lng: 78.963 },    IO: { lat: -6.343, lng: 71.877 },
  IQ: { lat: 33.223, lng: 43.679 },    IR: { lat: 32.428, lng: 53.688 },
  IS: { lat: 64.963, lng: -19.021 },   IT: { lat: 41.872, lng: 12.567 },
  JE: { lat: 49.214, lng: -2.131 },    JM: { lat: 18.109, lng: -77.298 },
  JO: { lat: 30.585, lng: 36.238 },    JP: { lat: 36.205, lng: 138.253 },
  KE: { lat: -0.024, lng: 37.906 },    KG: { lat: 41.204, lng: 74.766 },
  KH: { lat: 12.566, lng: 104.991 },   KI: { lat: -3.370, lng: -168.734 },
  KM: { lat: -11.875, lng: 43.872 },   KN: { lat: 17.358, lng: -62.783 },
  KP: { lat: 40.340, lng: 127.510 },   KR: { lat: 35.908, lng: 127.767 },
  KW: { lat: 29.312, lng: 47.481 },    KY: { lat: 19.314, lng: -81.255 },
  KZ: { lat: 48.020, lng: 66.924 },    LA: { lat: 19.856, lng: 102.495 },
  LB: { lat: 33.855, lng: 35.862 },    LC: { lat: 13.909, lng: -60.979 },
  LI: { lat: 47.166, lng: 9.555 },     LK: { lat: 7.873, lng: 80.772 },
  LR: { lat: 6.428, lng: -9.429 },     LS: { lat: -29.610, lng: 28.234 },
  LT: { lat: 55.169, lng: 23.881 },    LU: { lat: 49.815, lng: 6.130 },
  LV: { lat: 56.880, lng: 24.603 },    LY: { lat: 26.335, lng: 17.228 },
  MA: { lat: 31.792, lng: -7.093 },    MC: { lat: 43.738, lng: 7.424 },
  MD: { lat: 47.411, lng: 28.370 },    ME: { lat: 42.708, lng: 19.374 },
  MF: { lat: 18.083, lng: -63.052 },   MG: { lat: -18.767, lng: 46.869 },
  MH: { lat: 7.131, lng: 171.184 },    MK: { lat: 41.608, lng: 21.745 },
  ML: { lat: 17.571, lng: -3.996 },    MM: { lat: 21.914, lng: 95.956 },
  MN: { lat: 46.862, lng: 103.847 },   MO: { lat: 22.199, lng: 113.544 },
  MP: { lat: 17.331, lng: 145.385 },   MQ: { lat: 14.642, lng: -61.024 },
  MR: { lat: 21.008, lng: -10.941 },   MS: { lat: 16.742, lng: -62.187 },
  MT: { lat: 35.938, lng: 14.375 },    MU: { lat: -20.348, lng: 57.552 },
  MV: { lat: 3.203, lng: 73.221 },     MW: { lat: -13.254, lng: 34.302 },
  MX: { lat: 23.635, lng: -102.553 },  MY: { lat: 4.210, lng: 101.976 },
  MZ: { lat: -18.665, lng: 35.530 },   NA: { lat: -22.958, lng: 18.490 },
  NC: { lat: -20.905, lng: 165.618 },  NE: { lat: 17.608, lng: 8.082 },
  NF: { lat: -29.041, lng: 167.955 },  NG: { lat: 9.082, lng: 8.675 },
  NI: { lat: 12.865, lng: -85.207 },   NL: { lat: 52.133, lng: 5.291 },
  NO: { lat: 60.472, lng: 8.469 },     NP: { lat: 28.395, lng: 84.124 },
  NR: { lat: -0.523, lng: 166.932 },   NU: { lat: -19.054, lng: -169.867 },
  NZ: { lat: -40.900, lng: 174.886 },  OM: { lat: 21.513, lng: 55.923 },
  PA: { lat: 8.538, lng: -80.782 },    PE: { lat: -9.190, lng: -75.015 },
  PF: { lat: -17.680, lng: -149.407 }, PG: { lat: -6.315, lng: 143.956 },
  PH: { lat: 12.880, lng: 121.774 },   PK: { lat: 30.375, lng: 69.345 },
  PL: { lat: 51.919, lng: 19.145 },    PM: { lat: 46.941, lng: -56.271 },
  PN: { lat: -24.704, lng: -127.439 }, PR: { lat: 18.221, lng: -66.591 },
  PS: { lat: 31.952, lng: 35.233 },    PT: { lat: 39.400, lng: -8.224 },
  PW: { lat: 7.515, lng: 134.583 },    PY: { lat: -23.443, lng: -58.444 },
  QA: { lat: 25.355, lng: 51.184 },    RE: { lat: -21.116, lng: 55.536 },
  RO: { lat: 45.943, lng: 24.967 },    RS: { lat: 44.017, lng: 21.006 },
  RU: { lat: 61.524, lng: 105.319 },   RW: { lat: -1.940, lng: 29.874 },
  SA: { lat: 23.886, lng: 45.079 },    SB: { lat: -9.646, lng: 160.156 },
  SC: { lat: -4.680, lng: 55.492 },    SD: { lat: 12.863, lng: 30.218 },
  SE: { lat: 60.128, lng: 18.644 },    SG: { lat: 1.352, lng: 103.820 },
  SH: { lat: -24.144, lng: -10.030 },  SI: { lat: 46.151, lng: 14.995 },
  SJ: { lat: 77.554, lng: 23.670 },    SK: { lat: 48.669, lng: 19.699 },
  SL: { lat: 8.461, lng: -11.780 },    SM: { lat: 43.942, lng: 12.458 },
  SN: { lat: 14.497, lng: -14.452 },   SO: { lat: 5.152, lng: 46.200 },
  SR: { lat: 3.920, lng: -56.028 },    SS: { lat: 6.877, lng: 31.307 },
  ST: { lat: 0.187, lng: 6.613 },      SV: { lat: 13.794, lng: -88.897 },
  SX: { lat: 18.043, lng: -63.055 },   SY: { lat: 34.802, lng: 38.997 },
  SZ: { lat: -26.523, lng: 31.466 },   TC: { lat: 21.694, lng: -71.798 },
  TD: { lat: 15.454, lng: 18.732 },    TF: { lat: -49.280, lng: 69.349 },
  TG: { lat: 8.620, lng: 0.825 },      TH: { lat: 15.870, lng: 100.993 },
  TJ: { lat: 38.861, lng: 71.276 },    TK: { lat: -9.200, lng: -171.848 },
  TL: { lat: -8.874, lng: 125.728 },   TM: { lat: 38.970, lng: 59.556 },
  TN: { lat: 33.887, lng: 9.537 },     TO: { lat: -21.179, lng: -175.198 },
  TR: { lat: 38.964, lng: 35.243 },    TT: { lat: 10.692, lng: -61.223 },
  TV: { lat: -7.110, lng: 177.649 },   TW: { lat: 23.698, lng: 120.961 },
  TZ: { lat: -6.369, lng: 34.889 },    UA: { lat: 48.379, lng: 31.166 },
  UG: { lat: 1.374, lng: 32.290 },     UM: { lat: 19.282, lng: 166.647 },
  US: { lat: 37.090, lng: -95.713 },   UY: { lat: -32.523, lng: -55.766 },
  UZ: { lat: 41.377, lng: 64.585 },    VA: { lat: 41.902, lng: 12.453 },
  VC: { lat: 12.984, lng: -61.287 },   VE: { lat: 6.424, lng: -66.590 },
  VG: { lat: 18.420, lng: -64.640 },   VI: { lat: 18.336, lng: -64.896 },
  VN: { lat: 14.058, lng: 108.277 },   VU: { lat: -15.377, lng: 166.959 },
  WF: { lat: -13.769, lng: -177.156 }, WS: { lat: -13.759, lng: -172.105 },
  YE: { lat: 15.553, lng: 48.516 },    YT: { lat: -12.827, lng: 45.166 },
  ZA: { lat: -30.560, lng: 22.938 },   ZM: { lat: -13.134, lng: 27.849 },
  ZW: { lat: -19.015, lng: 29.155 },   XK: { lat: 42.603, lng: 20.903 },
};

// ─────────────────────────────────────────────────────────────────────────────
// HEBREW LOCATION → ENGLISH DISPLAY NAME
// Maps the exact Hebrew strings stored in location_mkmbv7be to a clean English label.
// ─────────────────────────────────────────────────────────────────────────────

const HEBREW_LOCATION_NAMES: Record<string, string> = {
  'אבו דאבי - Abu Dhabi - United Arab Emirates': 'Abu Dhabi, UAE',
  'אהנגמה, Sri Lanka':                            'Ahangama, Sri Lanka',
  'אהנגאמה, Sri Lanka':                           'Ahangama, Sri Lanka',
  'אינסברוק, Austria':                            'Innsbruck, Austria',
  'איסטנבול, İstanbul, Türkiye':                 'Istanbul, Turkey',
  'אמסטרדם, Netherlands':                         'Amsterdam, Netherlands',
  'ברום WA, Australia':                           'Broome, Australia',
  'גואה, India':                                  'Goa, India',
  'דרום אמריקה':                                  'South America',
  'דרמסאלה, Himachal Pradesh, India':             'Dharamshala, India',
  'האקובה, Nagano, Japan':                        'Hakuba, Japan',
  'הולבוש, Mexico':                               'Holbox, Mexico',
  'ואנג וייניג, Laos':                            'Vang Vieng, Laos',
  'ואנג ויינג, Laos':                             'Vang Vieng, Laos',
  'טוקיו, Japan':                                 'Tokyo, Japan',
  'יוטה, USA':                                    'Utah, USA',
  'לואנג פרבאנג, Laos':                           'Luang Prabang, Laos',
  'לונדון, UK':                                   'London, UK',
  'מקסיקו סיטי, Mexico':                          'Mexico City, Mexico',
  'ניו אורלינס, LA, USA':                         'New Orleans, USA',
  'ניו יורק, NY, USA':                            'New York, USA',
  'נפאל':                                         'Nepal',
  'סאו פאולו, São Paulo - State of São Paulo, Brazil': 'São Paulo, Brazil',
  'פאי, Pai District, Mae Hong Son, Thailand':    'Pai, Thailand',
  'פוקט, Mueang Phuket District, Phuket, Thailand': 'Phuket, Thailand',
  'פוקט, Thailand':                               'Phuket, Thailand',
  'פושקר, Rajasthan, India':                      'Pushkar, India',
  'פנום פן, Cambodia':                            'Phnom Penh, Cambodia',
  "צ'יאנג מאי, Mueang Chiang Mai District, Chiang Mai, Thailand": 'Chiang Mai, Thailand',
  'קו טאו, Thailand':                             'Koh Tao, Thailand',
  'קו סמוי, Ko Samui District, Surat Thani, Thailand': 'Koh Samui, Thailand',
  'קו פה נגאן, Ko Pha-ngan District, Surat Thani, Thailand': 'Koh Phangan, Thailand',
  'קו פי פי, Mueang Krabi District, Krabi, Thailand': 'Ko Phi Phi, Thailand',
  'קנקון, Quintana Roo, Mexico':                  'Cancún, Mexico',
  'שירגאו':                                       'Siargao, Philippines',
};

/**
 * Returns a clean English display name for a location string.
 * Falls back to the original value if no translation exists.
 */
export function toEnglishName(location: string): string {
  return HEBREW_LOCATION_NAMES[location] ?? location;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────

// Pre-built lowercase versions for case-insensitive lookup
const _coordLower = Object.fromEntries(
  Object.entries(COORDINATE_MAP).map(([k, v]) => [k.toLowerCase(), v])
);
const _countryLower = Object.fromEntries(
  Object.entries(COUNTRY_MAP).map(([k, v]) => [k.toLowerCase(), v])
);

/**
 * Resolves lat/lng for an incident.
 *
 * Priority:
 *   1. location_mkmbv7be  →  COORDINATE_MAP    (city-level precision)
 *   2. location_mkmbv7be  →  COUNTRY_MAP       (in case it holds a country name)
 *   3. country_mkmb91h3   →  COUNTRY_MAP       (country centroid fallback)
 *   4. country_mkmb91h3   →  COORDINATE_MAP    (last resort by name)
 *   5. countryCode        →  COUNTRY_CODE_MAP  (ISO-2 catch-all — any country)
 *   6. null               →  incident excluded from the globe
 *
 * Step 5 means a country we've never handled before still lands on the globe at
 * its centroid, with no need to add it to the maps above.
 */
export function getCoordinates(
  location: string | null | undefined,
  country: string | null | undefined,
  countryCode?: string | null | undefined,
): Coords | null {
  if (location) {
    const key = location.trim().toLowerCase();
    if (_coordLower[key])   return _coordLower[key];
    if (_countryLower[key]) return _countryLower[key];
  }

  if (country) {
    const key = country.trim().toLowerCase();
    if (_countryLower[key]) return _countryLower[key];
    if (_coordLower[key])   return _coordLower[key];
  }

  if (countryCode) {
    const code = countryCode.trim().toUpperCase();
    if (COUNTRY_CODE_MAP[code]) return COUNTRY_CODE_MAP[code];
  }

  if (location || country || countryCode) {
    console.warn('[Globe] no coords for:', { location, country, countryCode });
  }
  return null;
}
