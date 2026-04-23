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
 *   1. location_mkmbv7be  →  COORDINATE_MAP  (city-level precision)
 *   2. location_mkmbv7be  →  COUNTRY_MAP     (in case it holds a country name)
 *   3. country_mkmb91h3   →  COUNTRY_MAP     (country centroid fallback)
 *   4. country_mkmb91h3   →  COORDINATE_MAP  (last resort)
 *   5. null               →  incident excluded from the globe
 */
export function getCoordinates(
  location: string | null | undefined,
  country: string | null | undefined,
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

  if (location || country) {
    console.warn('[Globe] no coords for:', { location, country });
  }
  return null;
}
