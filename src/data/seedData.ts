import { WasteReport, UserProfile, NotificationItem } from '../types';

export const akwaIbomLGAs = [
  "Abak",
  "Eastern Obolo",
  "Eket",
  "Esit Eket",
  "Essien Udim",
  "Etim Ekpo",
  "Etinan",
  "Ibeno",
  "Ibesikpo Asutan",
  "Ibiono Ibom",
  "Ika",
  "Ikono",
  "Ikot Abasi",
  "Ikot Ekpene",
  "Ini",
  "Itu",
  "Mbo",
  "Mkpat Enin",
  "Nsit Atai",
  "Nsit Ibom",
  "Nsit Ubium",
  "Obot Akara",
  "Okobo",
  "Onna",
  "Oron",
  "Oruk Anam",
  "Udung Uko",
  "Ukanafun",
  "Uruan",
  "Urue Offong/Oruko",
  "Uyo"
];

export const AKWA_IBOM_LGAS = akwaIbomLGAs;

export interface AkwaIbomLocationItem {
  name: string;
  lat: number;
  lng: number;
  lga: string;
  type: 'lga' | 'street' | 'landmark';
  note?: string;
  zoom?: number;
}

// Geographic Boundary of Akwa Ibom State, Nigeria
// Ensures all search, geocoding and map navigations strictly remain within Akwa Ibom State
export const isInsideAkwaIbom = (lat: number, lng: number): boolean => {
  return lat >= 4.30 && lat <= 5.58 && lng >= 7.30 && lng <= 8.45;
};

// Complete 31 LGAs with exact geographical coordinates
export const ALL_31_AKWA_IBOM_LGAS_COORDINATES: AkwaIbomLocationItem[] = [
  { name: 'Abak LGA', lat: 4.9833, lng: 7.7833, lga: 'Abak', type: 'lga', note: 'Abak Local Government Headquarters', zoom: 15 },
  { name: 'Eastern Obolo LGA', lat: 4.5167, lng: 7.6833, lga: 'Eastern Obolo', type: 'lga', note: 'Okoroete coastal area', zoom: 14 },
  { name: 'Eket LGA', lat: 4.6456, lng: 7.9345, lga: 'Eket', type: 'lga', note: 'Eket Central & Government Secondary School, Afaha Eket', zoom: 16 },
  { name: 'Esit Eket LGA', lat: 4.6500, lng: 8.0500, lga: 'Esit Eket', type: 'lga', note: 'Uquo - Esit Eket Headquarters', zoom: 14 },
  { name: 'Essien Udim LGA', lat: 5.1500, lng: 7.6000, lga: 'Essien Udim', type: 'lga', note: 'Afaha Ikot Ebak', zoom: 14 },
  { name: 'Etim Ekpo LGA', lat: 5.0833, lng: 7.6167, lga: 'Etim Ekpo', type: 'lga', note: 'Utu Etim Ekpo', zoom: 14 },
  { name: 'Etinan LGA', lat: 4.8467, lng: 7.8544, lga: 'Etinan', type: 'lga', note: 'Etinan Town', zoom: 15 },
  { name: 'Ibeno LGA', lat: 4.5420, lng: 7.9820, lga: 'Ibeno', type: 'lga', note: 'Ukpenekang / Ibeno Coast', zoom: 15 },
  { name: 'Ibesikpo Asutan LGA', lat: 4.9667, lng: 7.9667, lga: 'Ibesikpo Asutan', type: 'lga', note: 'Nung Udoe Headquarters', zoom: 15 },
  { name: 'Ibiono-Ibom LGA', lat: 5.2333, lng: 7.8667, lga: 'Ibiono-Ibom', type: 'lga', note: 'Oko Ita Headquarters', zoom: 14 },
  { name: 'Ika LGA', lat: 5.0333, lng: 7.5500, lga: 'Ika', type: 'lga', note: 'Urua Inyang', zoom: 14 },
  { name: 'Ikono LGA', lat: 5.2500, lng: 7.8000, lga: 'Ikono', type: 'lga', note: 'Ibiaku Ntok Okpo', zoom: 14 },
  { name: 'Ikot Abasi LGA', lat: 4.5667, lng: 7.5500, lga: 'Ikot Abasi', type: 'lga', note: 'Ikot Abasi Port & ALSCON axis', zoom: 15 },
  { name: 'Ikot Ekpene LGA', lat: 5.1819, lng: 7.7148, lga: 'Ikot Ekpene', type: 'lga', note: 'Raffia City Central', zoom: 16 },
  { name: 'Ini LGA', lat: 5.4333, lng: 7.7500, lga: 'Ini', type: 'lga', note: 'Odoro Ikpe Headquarters', zoom: 14 },
  { name: 'Itu LGA', lat: 5.2000, lng: 7.9833, lga: 'Itu', type: 'lga', note: 'Mbiodpun / Itu Bridgehead', zoom: 14 },
  { name: 'Mbo LGA', lat: 4.6667, lng: 8.2833, lga: 'Mbo', type: 'lga', note: 'Enwang Headquarters & Ibaka deep sea', zoom: 14 },
  { name: 'Mkpat-Enin LGA', lat: 4.7333, lng: 7.7500, lga: 'Mkpat-Enin', type: 'lga', note: 'Mkpat Enin Town', zoom: 14 },
  { name: 'Nsit-Atai LGA', lat: 4.8667, lng: 8.0167, lga: 'Nsit-Atai', type: 'lga', note: 'Oron Road / Odot Headquarters', zoom: 14 },
  { name: 'Nsit-Ibom LGA', lat: 4.8833, lng: 7.9000, lga: 'Nsit-Ibom', type: 'lga', note: 'Afaha Offiong Headquarters', zoom: 14 },
  { name: 'Nsit-Ubium LGA', lat: 4.7667, lng: 7.9333, lga: 'Nsit-Ubium', type: 'lga', note: 'Ikots Eyo Headquarters', zoom: 14 },
  { name: 'Obot Akara LGA', lat: 5.2833, lng: 7.6167, lga: 'Obot Akara', type: 'lga', note: 'Nto Edino Headquarters', zoom: 14 },
  { name: 'Okobo LGA', lat: 4.8333, lng: 8.1333, lga: 'Okobo', type: 'lga', note: 'Okopedi Headquarters', zoom: 14 },
  { name: 'Onna LGA', lat: 4.6167, lng: 7.8667, lga: 'Onna', type: 'lga', note: 'Abat Headquarters', zoom: 15 },
  { name: 'Oron LGA', lat: 4.8255, lng: 8.2342, lga: 'Oron', type: 'lga', note: 'Oron Beach & Maritime city', zoom: 16 },
  { name: 'Oruk Anam LGA', lat: 4.8833, lng: 7.6500, lga: 'Oruk Anam', type: 'lga', note: 'Ikots Ibritam Headquarters', zoom: 14 },
  { name: 'Udung-Uko LGA', lat: 4.7833, lng: 8.2333, lga: 'Udung-Uko', type: 'lga', note: 'Eyofin Headquarters', zoom: 14 },
  { name: 'Ukanafun LGA', lat: 4.9500, lng: 7.5833, lga: 'Ukanafun', type: 'lga', note: 'Ikots Akpa Nkuk', zoom: 14 },
  { name: 'Uruan LGA', lat: 5.0167, lng: 8.0667, lga: 'Uruan', type: 'lga', note: 'Idu Uruan Headquarters', zoom: 14 },
  { name: 'Urue-Offong/Oruko LGA', lat: 4.7667, lng: 8.1667, lga: 'Urue-Offong/Oruko', type: 'lga', note: 'Urue Offong Town', zoom: 14 },
  { name: 'Uyo LGA', lat: 5.0374, lng: 7.9128, lga: 'Uyo (Capital City)', type: 'lga', note: 'State Capital & Ibom Plaza', zoom: 16 },
];

export const POPULAR_STREETS_AND_LANDMARKS: AkwaIbomLocationItem[] = [
  // --- MANDATORY CENTRAL HUB & EKET STREETS ---
  { name: 'Government Secondary School, Afaha Eket', lat: 4.6456, lng: 7.9345, lga: 'Eket', type: 'landmark', note: 'Central Waste Aggregation Point - Afaha Ukwah St', zoom: 18 },
  { name: 'Afaha Ukwah Street, Eket', lat: 4.6456, lng: 7.9345, lga: 'Eket', type: 'street', note: 'Government Secondary School perimeter', zoom: 18 },
  { name: 'Market Road, Eket', lat: 4.6469, lng: 7.9384, lga: 'Eket', type: 'street', note: 'Busy commercial corridor & main market', zoom: 18 },
  { name: 'Marina Road, Eket', lat: 4.6410, lng: 7.9290, lga: 'Eket', type: 'street', note: 'Waterfront trade axis & harbor', zoom: 18 },
  { name: 'Grace Bill Road, Eket', lat: 4.6490, lng: 7.9380, lga: 'Eket', type: 'street', note: 'Mobil airstrip road corridor', zoom: 18 },
  { name: 'Liverpool Street, Eket', lat: 4.6425, lng: 7.9312, lga: 'Eket', type: 'street', note: 'Marina waterfront residential sub-street', zoom: 18 },
  { name: 'Stadium Road, Eket', lat: 4.6480, lng: 7.9410, lga: 'Eket', type: 'street', note: 'Eket Township Stadium sports corridor', zoom: 18 },
  { name: 'Eket Township Stadium', lat: 4.6485, lng: 7.9415, lga: 'Eket', type: 'landmark', note: 'Ultra-modern sports complex & recycling hub', zoom: 18 },
  { name: 'Atabong Road, Eket', lat: 4.6438, lng: 7.9360, lga: 'Eket', type: 'street', note: 'Major commercial retail road', zoom: 18 },
  { name: 'Idua Road, Eket', lat: 4.6390, lng: 7.9270, lga: 'Eket', type: 'street', note: 'Idua village avenue', zoom: 18 },
  { name: 'Edem Udo Street, Eket', lat: 4.6445, lng: 7.9330, lga: 'Eket', type: 'street', note: 'Connecting Afaha Eket & Market Rd', zoom: 18 },
  { name: 'Afaha Eket Road, Eket', lat: 4.6460, lng: 7.9350, lga: 'Eket', type: 'street', note: 'Afaha Eket village center', zoom: 18 },
  // --- POPULAR SPOTS, PHARMACIES, HOTELS, BARS, RESTAURANTS & LANDMARKS (EKET & AKWA IBOM) ---
  // Requested Spots & Businesses:
  { name: 'Lexasens (Digital Marketing & Technology Agency)', lat: 5.0315, lng: 7.9255, lga: 'Uyo (Capital City)', type: 'landmark', note: '5 Mendie Street, Uyo LGA - Digital marketing, SEO, tech agency & media', zoom: 19 },
  { name: 'Lexasens Media & Tech Hub (Afaha Eket branch)', lat: 4.6465, lng: 7.9352, lga: 'Eket', type: 'landmark', note: 'Afaha Eket Road / Mendie axis, Eket LGA - Digital branding & creative services', zoom: 19 },
  { name: 'Mendie Street, Uyo', lat: 5.0315, lng: 7.9255, lga: 'Uyo (Capital City)', type: 'street', note: 'Lexasens headquarters & commercial creative street', zoom: 19 },
  { name: 'Ghassan Hotel & Suites, Afaha Eket', lat: 4.6462, lng: 7.9348, lga: 'Eket', type: 'landmark', note: 'Afaha Eket village center, Eket LGA - Popular hospitality & lodging spot', zoom: 19 },
  { name: 'All Weather (Allweather Road & Group of Schools)', lat: 4.6432, lng: 7.9358, lga: 'Eket', type: 'landmark', note: 'All Weather School & Road, Eket LGA - Key recycling collection point', zoom: 19 },
  { name: 'Allweather Road, Eket', lat: 4.6432, lng: 7.9358, lga: 'Eket', type: 'street', note: 'All Weather corridor connecting Hampton Lodge & Edem Udo', zoom: 19 },
  { name: 'Ekmat Pharmacy and Stores', lat: 4.6472, lng: 7.9405, lga: 'Eket', type: 'landmark', note: 'Plot 10 Isong Udoito St, Uqua Eket LGA - Medical packaging & sachet recycling', zoom: 19 },
  { name: 'Harmony Hotels, Eket', lat: 4.6441, lng: 7.9372, lga: 'Eket', type: 'landmark', note: '4 Edam Street, off Eket-Oron Road, Eket LGA - Hospitality corridor', zoom: 19 },
  { name: 'Hampton Lodge Hotel, Eket', lat: 4.6430, lng: 7.9355, lga: 'Eket', type: 'landmark', note: '13 Allweather Road, Eket LGA - Lodging & dining', zoom: 19 },
  { name: 'Royalty Hotels & Recreations, Eket', lat: 4.6495, lng: 7.9392, lga: 'Eket', type: 'landmark', note: 'Grace Bill Road, Eket LGA - Luxury lodging & leisure', zoom: 19 },
  { name: 'Boveeri Pavilion & Suites, Eket', lat: 4.6465, lng: 7.9325, lga: 'Eket', type: 'landmark', note: 'Hospitality & event spot, Eket LGA', zoom: 19 },
  { name: 'Eden Hotels Ltd, Eket', lat: 4.6450, lng: 7.9365, lga: 'Eket', type: 'landmark', note: 'Popular hotel & lounge spot, Eket LGA', zoom: 19 },
  { name: 'Tiano Hotel & Suites, Eket', lat: 4.6475, lng: 7.9340, lga: 'Eket', type: 'landmark', note: 'Hospitality hub, Eket LGA', zoom: 19 },
  { name: 'Joddag Hotel and Suites, Eket', lat: 4.6420, lng: 7.9380, lga: 'Eket', type: 'landmark', note: 'Near stadium axis, Eket LGA', zoom: 19 },
  { name: 'Grace Garden Apartments, Eket', lat: 4.6482, lng: 7.9368, lga: 'Eket', type: 'landmark', note: 'Residential hospitality spot, Eket LGA', zoom: 19 },
  { name: 'Villa Marina Hotel, Eket', lat: 4.6408, lng: 7.9285, lga: 'Eket', type: 'landmark', note: 'Marina Road waterfront resort, Eket LGA', zoom: 19 },
  { name: 'Qua River Hotel, Eket', lat: 4.6380, lng: 7.9240, lga: 'Eket', type: 'landmark', note: 'Historical hotel along Qua River, Eket LGA', zoom: 19 },

  // --- RESTAURANTS, BARS, CLUBS & CAFES (EKET & UYO) ---
  { name: 'The Promise Restaurant & Fast Food, Eket', lat: 4.6478, lng: 7.9385, lga: 'Eket', type: 'landmark', note: 'Grace Bill Road, Eket LGA - Quick dining & eatery', zoom: 19 },
  { name: "Mr Bigg's Restaurant, Eket", lat: 4.6485, lng: 7.9379, lga: 'Eket', type: 'landmark', note: 'Grace Bill Road axis, Eket LGA - Popular fast food', zoom: 19 },
  { name: 'Chicken Republic, Eket', lat: 4.6470, lng: 7.9382, lga: 'Eket', type: 'landmark', note: 'Market Road corridor, Eket LGA - Fast food & fried chicken', zoom: 19 },
  { name: 'Feelings Bar & Lounge, Eket', lat: 4.6415, lng: 7.9298, lga: 'Eket', type: 'landmark', note: '27 Marina Road, Eket LGA - Nightlife, drinks & music', zoom: 19 },
  { name: 'Liquid Lounge & Bar, Eket', lat: 4.6445, lng: 7.9362, lga: 'Eket', type: 'landmark', note: 'Atabong Road, Eket LGA - Cocktail bar & nightlife spot', zoom: 19 },
  { name: 'Hexagon Luxury Lounge, Eket', lat: 4.6468, lng: 7.9395, lga: 'Eket', type: 'landmark', note: 'Hospitality corridor, Eket LGA - Club, bar & grill', zoom: 19 },
  { name: 'Chill Island Bar & Kitchen, Eket', lat: 4.6422, lng: 7.9305, lga: 'Eket', type: 'landmark', note: 'Marina axis, Eket LGA - Open air relaxation bar', zoom: 19 },
  { name: 'Uncle G Shawarma & BBQ Grill, Eket', lat: 4.6455, lng: 7.9342, lga: 'Eket', type: 'landmark', note: 'Edem Udo Street, Eket LGA - Street food & grill spot', zoom: 19 },
  { name: 'Mama Put Native Kitchen, Afaha Eket', lat: 4.6461, lng: 7.9354, lga: 'Eket', type: 'landmark', note: 'Afaha Eket, Eket LGA - Traditional Afang & Edikang Ikong kitchen', zoom: 19 },
  { name: 'Eket Sports Club & Lounge', lat: 4.6480, lng: 7.9400, lga: 'Eket', type: 'landmark', note: 'Sports, tennis & recreation lounge, Eket LGA', zoom: 19 },

  // --- HEALTH & PHARMACIES (EKET & ENVIRONS) ---
  { name: 'Immanuel General Hospital, Eket', lat: 4.6425, lng: 7.9335, lga: 'Eket', type: 'landmark', note: 'Hospital Road, Eket LGA - Government general medical center', zoom: 19 },
  { name: 'Afaha Eket Primary Health Centre', lat: 4.6458, lng: 7.9340, lga: 'Eket', type: 'landmark', note: 'Afaha Eket, Eket LGA - Community health & immunization clinic', zoom: 19 },
  { name: 'H-Cares Pharmacy & Diagnostics, Eket', lat: 4.6465, lng: 7.9388, lga: 'Eket', type: 'landmark', note: 'Market Road, Eket LGA - Pharmaceutical & clinical store', zoom: 19 },
  { name: 'Divine Care Pharmacy, Afaha Eket', lat: 4.6452, lng: 7.9349, lga: 'Eket', type: 'landmark', note: 'Afaha Ukwah / Afaha Eket, Eket LGA - Community dispensary', zoom: 19 },
  { name: 'HealthRite Pharmacy, Eket', lat: 4.6480, lng: 7.9375, lga: 'Eket', type: 'landmark', note: 'Grace Bill Road, Eket LGA - Pharmacy & wellness store', zoom: 19 },

  // --- MARKETS, PLAZAS & STORES (EKET) ---
  { name: 'Eket Modern Market (Uqua Market)', lat: 4.6470, lng: 7.9390, lga: 'Eket', type: 'landmark', note: 'Main commercial trading & sachet collection point, Eket LGA', zoom: 19 },
  { name: 'Atabong Market, Eket', lat: 4.6435, lng: 7.9355, lga: 'Eket', type: 'landmark', note: 'Fresh produce & seafood market, Eket LGA', zoom: 19 },
  { name: 'Afaha Eket Daily Market', lat: 4.6465, lng: 7.9350, lga: 'Eket', type: 'landmark', note: 'Neighborhood daily market, Eket LGA', zoom: 19 },
  { name: 'CHOICY Events & Plaza, Eket', lat: 4.6462, lng: 7.9378, lga: 'Eket', type: 'landmark', note: 'Commercial plaza & event grounds, Eket LGA', zoom: 19 },
  { name: 'St. Gregory Catholic Church, Eket', lat: 4.6448, lng: 7.9315, lga: 'Eket', type: 'landmark', note: 'Religious center & civic landmark, Eket LGA', zoom: 19 },

  // --- UYO (CAPITAL CITY) SPOTS, RESTAURANTS, BARS & HOTELS ---
  { name: 'Stadium Road, Uyo', lat: 5.0064, lng: 7.8847, lga: 'Uyo (Capital City)', type: 'street', note: 'Godswill Akpabio International Stadium axis', zoom: 18 },
  { name: 'Godswill Akpabio International Stadium (Nest of Champions)', lat: 5.0064, lng: 7.8847, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ring Road 3, Goodluck Jonathan Boulevard', zoom: 18 },
  { name: 'Ring Road 3, Uyo', lat: 5.0090, lng: 7.8860, lga: 'Uyo (Capital City)', type: 'street', note: 'Stadium expressway', zoom: 18 },
  { name: 'Ibom Plaza, Uyo', lat: 5.0374, lng: 7.9128, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Central roundabout municipal recycling node', zoom: 18 },
  { name: 'Oron Road, Uyo', lat: 5.0250, lng: 7.9350, lga: 'Uyo (Capital City)', type: 'street', note: 'Major commercial highway in Uyo', zoom: 18 },
  { name: 'Aka Road, Uyo', lat: 5.0220, lng: 7.9180, lga: 'Uyo (Capital City)', type: 'street', note: 'Aka roundabout commercial avenue', zoom: 18 },
  { name: 'Abak Road, Uyo', lat: 5.0310, lng: 7.9050, lga: 'Uyo (Capital City)', type: 'street', note: 'Connects Uyo to Abak LGA', zoom: 18 },
  { name: 'Ikpa Road, Uyo', lat: 5.0381, lng: 7.9232, lga: 'Uyo (Capital City)', type: 'street', note: 'University of Uyo town campus gate', zoom: 18 },
  { name: 'Wellington Bassey Way, Uyo', lat: 5.0350, lng: 7.9290, lga: 'Uyo (Capital City)', type: 'street', note: 'Government House & Barracks axis', zoom: 18 },
  { name: 'Nwaniba Road, Uyo', lat: 5.0390, lng: 7.9450, lga: 'Uyo (Capital City)', type: 'street', note: 'Ibom Icon Hotel & Golf corridor', zoom: 18 },
  { name: 'Four Lanes (Edet Akpan Avenue), Uyo', lat: 5.0180, lng: 7.9320, lga: 'Uyo (Capital City)', type: 'street', note: 'Prime commercial banking avenue', zoom: 18 },
  { name: 'Brooks Street, Uyo', lat: 5.0330, lng: 7.9210, lga: 'Uyo (Capital City)', type: 'street', note: 'City centre residential and trade sub-street', zoom: 18 },
  { name: 'Gibbs Street, Uyo', lat: 5.0340, lng: 7.9190, lga: 'Uyo (Capital City)', type: 'street', note: 'Commercial sub-street near Plaza', zoom: 18 },
  { name: 'Barracks Road, Uyo', lat: 5.0360, lng: 7.9260, lga: 'Uyo (Capital City)', type: 'street', note: 'Uyo city center artery', zoom: 18 },
  { name: 'University of Uyo (Uniuyo)', lat: 5.0381, lng: 7.9232, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Student campus beverage bottle point', zoom: 18 },
  { name: 'Ibom Hall, Uyo', lat: 5.0196, lng: 7.9284, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Event grounds & paper baling point', zoom: 18 },
  { name: 'Ibom Icon Hotel & Golf Resort', lat: 5.0410, lng: 7.9620, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Luxury resort & hospitality point, Nwaniba, Uyo', zoom: 18 },
  { name: 'Monty Suites, Uyo', lat: 5.0230, lng: 7.9315, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Lane 2, Edet Akpan Ave (Four Lanes), Uyo - Luxury hotel & restaurant', zoom: 19 },
  { name: 'Luton Park Hotel, Uyo', lat: 5.0255, lng: 7.9280, lga: 'Uyo (Capital City)', type: 'landmark', note: '3 Club Road, Uyo LGA - Hospitality & event center', zoom: 19 },
  { name: 'Rosmohr Luxury Hotel, Uyo', lat: 5.0215, lng: 7.9360, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ewet Housing Estate, Uyo LGA - High-end boutique hotel', zoom: 19 },
  { name: 'ALiz Amour Hotel, Uyo', lat: 5.0245, lng: 7.9340, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ewet Housing, Uyo LGA - Boutique accommodation', zoom: 19 },
  { name: 'Tevoli Hotel & Suites, Uyo', lat: 5.0195, lng: 7.9295, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Hospitality corridor, Uyo LGA', zoom: 19 },
  { name: 'Ibom Tropicana Entertainment Centre & Mall', lat: 5.0120, lng: 7.9250, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Cinema, mall & recreation center, Udo Udoma Ave, Uyo', zoom: 18 },
  { name: 'Market Square Supermarket, Uyo', lat: 5.0175, lng: 7.9310, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Edet Akpan Ave (Four Lanes), Uyo - Grocery, bakery & retail', zoom: 19 },
  { name: 'Everyday Supermarket, Uyo', lat: 5.0235, lng: 7.9220, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Oron Road, Uyo LGA - Major supermarket & shopping center', zoom: 19 },
  { name: 'Kilimanjaro Restaurant, Uyo (Oron Road)', lat: 5.0260, lng: 7.9270, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Oron Road, Uyo LGA - Popular restaurant & quick meals', zoom: 19 },
  { name: 'Kilimanjaro Restaurant, Uyo (Ikot Ekpene Road)', lat: 5.0320, lng: 7.9150, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ikot Ekpene Road, Uyo LGA - Fast casual dining', zoom: 19 },
  { name: 'De Choice Fast Food & Mall, Uyo', lat: 5.0280, lng: 7.9210, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Popular food spot, Ikot Ekpene Road, Uyo', zoom: 18 },
  { name: 'Rodiz Bistro & Cafe, Uyo', lat: 5.0225, lng: 7.9330, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ewet Housing Estate, Uyo LGA - Gourmet dining & cocktails', zoom: 19 },
  { name: 'Food Affairs Eatery & Bakery, Uyo', lat: 5.0270, lng: 7.9240, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Aka Road, Uyo LGA - Family eatery & pastry bar', zoom: 19 },
  { name: 'Drumstix Restaurant & Cafe, Uyo', lat: 5.0290, lng: 7.9200, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ikot Ekpene Road, Uyo LGA - Fast dining & pastries', zoom: 19 },
  { name: 'Da Juice Bar & Healthy Bistro, Uyo', lat: 5.0200, lng: 7.9300, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Edet Akpan Ave, Uyo LGA - Fresh juices & grills', zoom: 19 },
  { name: 'Play House Lounge & Club, Uyo', lat: 5.0190, lng: 7.9325, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Edet Akpan Ave, Uyo LGA - Nightclub, VIP lounge & drinks', zoom: 19 },
  { name: 'Signature Luxury Lounge & Bar, Uyo', lat: 5.0210, lng: 7.9350, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ewet Housing Estate, Uyo LGA - Premium cocktail lounge', zoom: 19 },
  { name: 'Planet 105 Bar & Grill, Uyo', lat: 5.0265, lng: 7.9260, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Oron Road axis, Uyo LGA - Sports bar, barbecue & beers', zoom: 19 },
  { name: "D'Guv Lounge & Garden, Uyo", lat: 5.0305, lng: 7.9220, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ikpa Road axis, Uyo LGA - Outdoor garden bar & suya', zoom: 19 },
  { name: 'Bamboo Luxury Lounge, Uyo', lat: 5.0240, lng: 7.9310, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Club Road axis, Uyo LGA - Ambient cocktail & grill lounge', zoom: 19 },
  { name: 'Vintage Lounge & Restaurant, Uyo', lat: 5.0185, lng: 7.9285, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Udo Udoma Ave axis, Uyo LGA - Relaxed lounge & dining', zoom: 19 },
  { name: 'Sky Lounge & Rooftop Bar, Uyo', lat: 5.0220, lng: 7.9340, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ewet Housing, Uyo LGA - Rooftop skyline views & nightlife', zoom: 19 },
  { name: 'Orange City Lounge, Uyo', lat: 5.0312, lng: 7.9245, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Near Mendie Street / Barracks Rd, Uyo LGA - Food, cocktails & entertainment', zoom: 19 },
  // --- TECH, PHONE & GADGET STORES (AKWA IBOM & UYO) ---
  { name: 'ITELHOME-HYCO TECH PHONE & GADGETS (Uyo)', lat: 5.0377, lng: 7.9238, lga: 'Uyo (Capital City)', type: 'landmark', note: 'No. 2 Barracks Road / Wellington Bassey Way, Ibom Plaza, Uyo - Official Itel phones, Hyco Tech smartphones, gadgets & accessories', zoom: 19 },
  { name: 'HYCO TECH PHONES AND COMPUTERS, Uyo', lat: 5.0377, lng: 7.9238, lga: 'Uyo (Capital City)', type: 'landmark', note: 'No. 2 Wellington Bassey Way / Ibom Plaza, Uyo - Phone sales, computer systems & accessories', zoom: 19 },
  { name: 'Itelhome Phone & Gadget Store, Uyo', lat: 5.0378, lng: 7.9239, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ibom Plaza / Barracks Road, Uyo - Itel smartphone sales, smart life accessories & repairs', zoom: 19 },
  { name: 'Hyco Technology Services, Uyo', lat: 5.0375, lng: 7.9240, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Wellington Bassey Way, Uyo - Tech hardware, gadget repair & accessories', zoom: 19 },
  { name: 'Itel Experience Centre & Phone Store, Uyo', lat: 5.0380, lng: 7.9242, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ibom Plaza / Aka Road axis, Uyo - Authorized itel smart device dealer', zoom: 19 },
  { name: 'Itel Official Store & Tech Hub, Eket', lat: 4.6468, lng: 7.9380, lga: 'Eket', type: 'landmark', note: 'Market Road / Grace Bill Road, Eket - Smartphones, phone accessories & sales', zoom: 19 },
  { name: 'Slot Systems (Phones & Laptops), Uyo', lat: 5.0382, lng: 7.9245, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Aka Road near Ibom Plaza, Uyo - Mobile phones, laptops & gadgets', zoom: 19 },
  { name: '3C Hub Smart Devices, Uyo', lat: 5.0370, lng: 7.9250, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Aka Road, Uyo - Mobile devices, accessories & warranty service', zoom: 19 },
  { name: 'Microstation Gadgets & Phones, Uyo', lat: 5.0365, lng: 7.9255, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Aka Road, Uyo - Phone repairs & gadget store', zoom: 19 },
  { name: 'Start Innovation Hub (Ibom e-Library)', lat: 5.0355, lng: 7.9320, lga: 'Uyo (Capital City)', type: 'landmark', note: 'IBB Way, Uyo LGA - Technology ecosystem & startup hub', zoom: 19 },
  { name: 'The Root Hub, Uyo', lat: 5.0385, lng: 7.9225, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Ikpa Road, Uyo LGA - Tech incubator & co-working space', zoom: 19 },
  { name: 'Dakkada Tower (21-Storey Smart Tower)', lat: 5.0165, lng: 7.9290, lga: 'Uyo (Capital City)', type: 'landmark', note: 'CBD, Bank Road / Udo Udoma Ave, Uyo LGA - Iconic state skyscraper', zoom: 19 },
  { name: 'Akpan Andem Market, Uyo', lat: 5.0345, lng: 7.9170, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Major municipal market & grocery hub, Uyo LGA', zoom: 19 },
  { name: 'Itam Peace Market, Uyo', lat: 5.0450, lng: 7.8980, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Largest regional wholesale produce & plastics market, Uyo LGA', zoom: 18 },
  { name: 'Med-Plus Pharmacy & Mart, Uyo', lat: 5.0180, lng: 7.9315, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Four Lanes (Edet Akpan Ave), Uyo LGA - Retail pharmacy & beauty', zoom: 19 },
  { name: 'Discovery Park, Uyo', lat: 5.0320, lng: 7.9260, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Open-air cultural park & leisure spot, Uyo', zoom: 18 },
  { name: 'Akwa Ibom State Secretariat Complex', lat: 5.0210, lng: 7.9310, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Idongesit Nkanga Secretariat, Uyo', zoom: 18 },
  { name: 'University of Uyo Teaching Hospital (UUTH)', lat: 5.0150, lng: 7.8920, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Abak Road tertiary health facility, Uyo', zoom: 18 },
  { name: 'Champion Breweries Industrial Complex, Uyo', lat: 5.0290, lng: 7.8920, lga: 'Uyo (Capital City)', type: 'landmark', note: 'Industrial beverage & recycling zone, Uyo', zoom: 18 },


  // --- IKOT EKPENE LGA (RAFFIA CITY) ---
  { name: 'Market Road, Ikot Ekpene', lat: 5.1819, lng: 7.7148, lga: 'Ikot Ekpene', type: 'street', note: 'Raffia market shopping street', zoom: 18 },
  { name: 'Ikot Ekpene Plaza & Market', lat: 5.1819, lng: 7.7148, lga: 'Ikot Ekpene', type: 'landmark', note: 'Raffia & scrap metal depot', zoom: 18 },
  { name: 'Aba Road, Ikot Ekpene', lat: 5.1800, lng: 7.7050, lga: 'Ikot Ekpene', type: 'street', note: 'Interstate commercial highway', zoom: 18 },
  { name: 'Uyo Road, Ikot Ekpene', lat: 5.1780, lng: 7.7250, lga: 'Ikot Ekpene', type: 'street', note: 'Connecting into Uyo expressway', zoom: 18 },
  { name: 'Hospital Road, Ikot Ekpene', lat: 5.1850, lng: 7.7180, lga: 'Ikot Ekpene', type: 'street', note: 'General hospital axis', zoom: 18 },
  { name: 'Station Road, Ikot Ekpene', lat: 5.1830, lng: 7.7120, lga: 'Ikot Ekpene', type: 'street', note: 'Old railway / trade sub-street', zoom: 18 },

  // --- ORON LGA ---
  { name: 'Oron Beach Jetty', lat: 4.8255, lng: 8.2342, lga: 'Oron', type: 'landmark', note: 'Coastal waterway clean-up station', zoom: 18 },
  { name: 'Customs Road, Oron', lat: 4.8230, lng: 8.2310, lga: 'Oron', type: 'street', note: 'Harbor trade & customs checkpoint', zoom: 18 },
  { name: 'Post Office Road, Oron', lat: 4.8260, lng: 8.2280, lga: 'Oron', type: 'street', note: 'Civic center street', zoom: 18 },
  { name: 'Hospital Road, Oron', lat: 4.8210, lng: 8.2250, lga: 'Oron', type: 'street', note: 'General hospital corridor', zoom: 18 },
  { name: 'Maritime Academy Road, Oron', lat: 4.8150, lng: 8.2380, lga: 'Oron', type: 'street', note: 'Maritime Academy of Nigeria campus gate', zoom: 18 },

  // --- IBENO LGA ---
  { name: 'Ibeno Beach Coastline', lat: 4.5420, lng: 7.9820, lga: 'Ibeno', type: 'landmark', note: 'Atlantic ocean beachfront plastic cleanup', zoom: 18 },
  { name: 'Ukpenekang Street, Ibeno', lat: 4.5450, lng: 7.9780, lga: 'Ibeno', type: 'street', note: 'Local council administrative street', zoom: 18 },
  { name: 'QIT Road (Qua Iboe Terminal), Ibeno', lat: 4.5500, lng: 7.9900, lga: 'Ibeno', type: 'street', note: 'Mobil terminal access artery', zoom: 18 },

  // --- ABAK LGA ---
  { name: 'Hospital Road, Abak', lat: 4.9850, lng: 7.7810, lga: 'Abak', type: 'street', note: 'Abak general hospital & school lane', zoom: 18 },
  { name: 'Ikot Abasi Road, Abak', lat: 4.9810, lng: 7.7850, lga: 'Abak', type: 'street', note: 'Connecting road to coastal LGAs', zoom: 18 },
  { name: 'Oruk Anam Way, Abak', lat: 4.9780, lng: 7.7790, lga: 'Abak', type: 'street', note: 'Agricultural trade road', zoom: 18 },

  // --- ONNA LGA ---
  { name: 'Abat Main Street, Onna', lat: 4.6180, lng: 7.8680, lga: 'Onna', type: 'street', note: 'Council secretariat axis', zoom: 18 },
  { name: 'Awa Iman Road, Onna', lat: 4.6220, lng: 7.8620, lga: 'Onna', type: 'street', note: 'Industrial park and plywood axis', zoom: 18 },

  // --- IKOT ABASI LGA ---
  { name: 'Marina Road, Ikot Abasi', lat: 4.5680, lng: 7.5520, lga: 'Ikot Abasi', type: 'street', note: 'Historic consulate & waterfront line', zoom: 18 },
  { name: 'ALSCON Road, Ikot Abasi', lat: 4.5720, lng: 7.5450, lga: 'Ikot Abasi', type: 'street', note: 'Aluminum smelter industrial highway', zoom: 18 },

  // --- ITU LGA ---
  { name: 'Calabar-Itu Highway', lat: 5.2010, lng: 7.9850, lga: 'Itu', type: 'street', note: 'Interstate transport bridgehead corridor', zoom: 18 },
  { name: 'Mary Slessor Avenue, Itu', lat: 5.1980, lng: 7.9820, lga: 'Itu', type: 'street', note: 'Historical mission station road', zoom: 18 },

  // --- ETINAN LGA ---
  { name: 'Etinan-Uyo Road', lat: 4.8480, lng: 7.8560, lga: 'Etinan', type: 'street', note: 'Main dual carriage connection to capital', zoom: 18 },
  { name: 'Hospital Road, Etinan', lat: 4.8450, lng: 7.8520, lga: 'Etinan', type: 'street', note: 'Etinan institute & hospital corridor', zoom: 18 },

  // --- ESSIEN UDIM LGA ---
  { name: 'Afaha Ikot Ebak Street, Essien Udim', lat: 5.1520, lng: 7.6020, lga: 'Essien Udim', type: 'street', note: 'Council headquarters main artery', zoom: 18 },

  // --- IBESIKPO ASUTAN LGA ---
  { name: 'Nung Udoe Market Street, Ibesikpo Asutan', lat: 4.9680, lng: 7.9680, lga: 'Ibesikpo Asutan', type: 'street', note: 'Nung Udoe commercial roundabout', zoom: 18 },

  // --- NSIT-IBOM LGA ---
  { name: 'Afaha Offiong Main Road, Nsit-Ibom', lat: 4.8850, lng: 7.9020, lga: 'Nsit-Ibom', type: 'street', note: 'Civic center and market access', zoom: 18 },

  // --- NSIT-UBIUM LGA ---
  { name: 'Ikot Eyo Secretariat Road, Nsit-Ubium', lat: 4.7680, lng: 7.9350, lga: 'Nsit-Ubium', type: 'street', note: 'Government council avenue', zoom: 18 },

  // --- MBO LGA ---
  { name: 'Ibaka Deep Sea Port Road, Mbo', lat: 4.6680, lng: 8.2850, lga: 'Mbo', type: 'street', note: 'Port gateway & fishing port street', zoom: 18 },

  // --- MKPAT-ENIN LGA ---
  { name: 'Akwa Ibom State University (AKSU) Road, Mkpat-Enin', lat: 4.7350, lng: 7.7520, lga: 'Mkpat-Enin', type: 'street', note: 'AKSU Ikot Akpaden campus access avenue', zoom: 18 },

  // --- UKANAFUN LGA ---
  { name: 'Ikots Akpa Nkuk Council Road, Ukanafun', lat: 4.9520, lng: 7.5850, lga: 'Ukanafun', type: 'street', note: 'Civic administrative street', zoom: 18 },

  // --- URUAN LGA ---
  { name: 'Idu Uruan Market Road, Uruan', lat: 5.0180, lng: 8.0680, lga: 'Uruan', type: 'street', note: 'Produce market and jetty street', zoom: 18 },

  // --- URUE-OFFONG/ORUKO LGA ---
  { name: 'Urue Offong Town Street', lat: 4.7680, lng: 8.1680, lga: 'Urue-Offong/Oruko', type: 'street', note: 'Town central market corridor', zoom: 18 },

  // --- OKOBO LGA ---
  { name: 'Okopedi Town Street, Okobo', lat: 4.8350, lng: 8.1350, lga: 'Okobo', type: 'street', note: 'Okobo council headquarters street', zoom: 18 },

  // --- EASTERN OBOLO LGA ---
  { name: 'Okoroete Town Road, Eastern Obolo', lat: 4.5180, lng: 7.6850, lga: 'Eastern Obolo', type: 'street', note: 'Coastal fishing harbor street', zoom: 18 },

  // --- ETIM EKPO LGA ---
  { name: 'Utu Etim Ekpo Market Road', lat: 5.0850, lng: 7.6180, lga: 'Etim Ekpo', type: 'street', note: 'Etim Ekpo council street', zoom: 18 },

  // --- IBIONO-IBOM LGA ---
  { name: 'Oko Ita Road, Ibiono-Ibom', lat: 5.2350, lng: 7.8680, lga: 'Ibiono-Ibom', type: 'street', note: 'Oko Ita headquarters avenue', zoom: 18 },

  // --- IKA LGA ---
  { name: 'Urua Inyang Town Road, Ika', lat: 5.0350, lng: 7.5520, lga: 'Ika', type: 'street', note: 'Ika local council market lane', zoom: 18 },

  // --- IKONO LGA ---
  { name: 'Ibiaku Ntok Okpo Road, Ikono', lat: 5.2520, lng: 7.8020, lga: 'Ikono', type: 'street', note: 'Cradle of the Ibibio headquarters road', zoom: 18 },

  // --- INI LGA ---
  { name: 'Odoro Ikpe Road, Ini', lat: 5.4350, lng: 7.7520, lga: 'Ini', type: 'street', note: 'Rice belt & agrarian hub road', zoom: 18 },

  // --- NSIT-ATAI LGA ---
  { name: 'Odot Town Road, Nsit-Atai', lat: 4.8680, lng: 8.0180, lga: 'Nsit-Atai', type: 'street', note: 'Odot headquarters & airport corridor', zoom: 18 },

  // --- OBOT AKARA LGA ---
  { name: 'Nto Edino Road, Obot Akara', lat: 5.2850, lng: 7.6180, lga: 'Obot Akara', type: 'street', note: 'Border trade and palm produce avenue', zoom: 18 },

  // --- ORUK ANAM LGA ---
  { name: 'Ikots Ibritam Road, Oruk Anam', lat: 4.8850, lng: 7.6520, lga: 'Oruk Anam', type: 'street', note: 'Commercial market roundabout', zoom: 18 },

  // --- UDUNG-UKO LGA ---
  { name: 'Eyofin Secretariat Road, Udung-Uko', lat: 4.7850, lng: 8.2350, lga: 'Udung-Uko', type: 'street', note: 'Administrative waterfront avenue', zoom: 18 },

  // --- ESIT EKET LGA ---
  { name: 'Uquo Council Road, Esit Eket', lat: 4.6520, lng: 8.0520, lga: 'Esit Eket', type: 'street', note: 'Uquo town council and community axis', zoom: 18 },
];

export const AKWA_IBOM_LANDMARKS = [
  ...ALL_31_AKWA_IBOM_LGAS_COORDINATES,
  ...POPULAR_STREETS_AND_LANDMARKS,
];


export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_CHATS: Record<string, import("../types").ChatMessage[]> = {};

// Empty initial reports: Database starts with 0 waste reports
export const INITIAL_REPORTS: WasteReport[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
