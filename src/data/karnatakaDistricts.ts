export type KarnatakaRegion =
  | 'Southern Karnataka'
  | 'Coastal & Malnad'
  | 'Kittur Karnataka'
  | 'Kalyana Karnataka';

export interface KarnatakaDistrict {
  slug: string;
  name: string;
  headquarters: string;
  region: KarnatakaRegion;
  coordinates: [number, number];
  highlight: string;
  originLabel: string;
}

export const KARNATAKA_DISTRICTS: KarnatakaDistrict[] = [
  {
    slug: 'bagalkot',
    name: 'Bagalkot',
    headquarters: 'Bagalkot',
    region: 'Kittur Karnataka',
    coordinates: [16.1817, 75.6958],
    highlight: 'Badami Cave Temples, Pattadakal UNESCO Group & Aihole',
    originLabel: 'Bagalkot, Karnataka',
  },
  {
    slug: 'ballari',
    name: 'Ballari',
    headquarters: 'Ballari',
    region: 'Kalyana Karnataka',
    coordinates: [15.1394, 76.9214],
    highlight: 'Ballari Hill Fort, Sandur Forest Hills & Kumaraswamy Temple',
    originLabel: 'Ballari, Karnataka',
  },
  {
    slug: 'belagavi',
    name: 'Belagavi',
    headquarters: 'Belagavi',
    region: 'Kittur Karnataka',
    coordinates: [15.8497, 74.4977],
    highlight: 'Gokak Waterfalls, Belagavi Fort & Kittur Heritage Citadel',
    originLabel: 'Belagavi, Karnataka',
  },
  {
    slug: 'bengaluru-rural',
    name: 'Bengaluru Rural',
    headquarters: 'Devanahalli',
    region: 'Southern Karnataka',
    coordinates: [13.2473, 77.7115],
    highlight: 'Devanahalli Fort, Savandurga Monolith & Nandi Foothills',
    originLabel: 'Bengaluru Rural (Devanahalli), Karnataka',
  },
  {
    slug: 'bengaluru-urban',
    name: 'Bengaluru Urban',
    headquarters: 'Bengaluru',
    region: 'Southern Karnataka',
    coordinates: [12.9716, 77.5946],
    highlight: 'Lalbagh Botanical Garden, Cubbon Park & Bangalore Palace',
    originLabel: 'Bengaluru Urban (Bengaluru), Karnataka',
  },
  {
    slug: 'bidar',
    name: 'Bidar',
    headquarters: 'Bidar',
    region: 'Kalyana Karnataka',
    coordinates: [17.9104, 77.5199],
    highlight: 'Bidar Fort, Bahmani Tombs & Gurudwara Nanak Jhira Sahib',
    originLabel: 'Bidar, Karnataka',
  },
  {
    slug: 'chamarajanagar',
    name: 'Chamarajanagar',
    headquarters: 'Chamarajanagar',
    region: 'Southern Karnataka',
    coordinates: [11.9261, 76.9437],
    highlight: 'Bandipur Tiger Reserve, BR Hills & Male Mahadeshwara Hills',
    originLabel: 'Chamarajanagar, Karnataka',
  },
  {
    slug: 'chikkaballapur',
    name: 'Chikkaballapur',
    headquarters: 'Chikkaballapur',
    region: 'Southern Karnataka',
    coordinates: [13.4355, 77.7315],
    highlight: 'Nandi Hills Sunrise Ridge, Skandagiri & Bhoga Nandeeshwara',
    originLabel: 'Chikkaballapur, Karnataka',
  },
  {
    slug: 'chikkamagaluru',
    name: 'Chikkamagaluru',
    headquarters: 'Chikkamagaluru',
    region: 'Coastal & Malnad',
    coordinates: [13.3161, 75.772],
    highlight: 'Mullayanagiri Peak, Baba Budangiri & Heritage Coffee Estates',
    originLabel: 'Chikkamagaluru, Karnataka',
  },
  {
    slug: 'chitradurga',
    name: 'Chitradurga',
    headquarters: 'Chitradurga',
    region: 'Southern Karnataka',
    coordinates: [14.2251, 76.398],
    highlight: 'Seven-Tiered Stone Fort, Chandravalli Caves & Jogimatti',
    originLabel: 'Chitradurga, Karnataka',
  },
  {
    slug: 'dakshina-kannada',
    name: 'Dakshina Kannada',
    headquarters: 'Mangaluru',
    region: 'Coastal & Malnad',
    coordinates: [12.9141, 74.856],
    highlight: 'Panambur & Tannirbhavi Beaches, Kudroli & Dharmasthala',
    originLabel: 'Dakshina Kannada (Mangaluru), Karnataka',
  },
  {
    slug: 'davanagere',
    name: 'Davanagere',
    headquarters: 'Davanagere',
    region: 'Southern Karnataka',
    coordinates: [14.4644, 75.9218],
    highlight: 'Kondajji Lake, Harihareshwara Temple & Iconic Benne Dosa',
    originLabel: 'Davanagere, Karnataka',
  },
  {
    slug: 'dharwad',
    name: 'Dharwad',
    headquarters: 'Dharwad',
    region: 'Kittur Karnataka',
    coordinates: [15.4589, 75.0078],
    highlight: 'Unkal Lake, Chandramouleshwara Temple & Hindustani Music Heritage',
    originLabel: 'Dharwad (Hubballi-Dharwad), Karnataka',
  },
  {
    slug: 'gadag',
    name: 'Gadag',
    headquarters: 'Gadag',
    region: 'Kittur Karnataka',
    coordinates: [15.4315, 75.6355],
    highlight: 'Trikuteshwara Temple, Lakkundi Stepped Wells & Magadi Lake',
    originLabel: 'Gadag, Karnataka',
  },
  {
    slug: 'hassan',
    name: 'Hassan',
    headquarters: 'Hassan',
    region: 'Southern Karnataka',
    coordinates: [13.0033, 76.1004],
    highlight: 'Belur Chennakeshava, Halebidu Hoysala & Shravanabelagola',
    originLabel: 'Hassan, Karnataka',
  },
  {
    slug: 'haveri',
    name: 'Haveri',
    headquarters: 'Haveri',
    region: 'Kittur Karnataka',
    coordinates: [14.7951, 75.3991],
    highlight: 'Siddhesvara Temple, Ranebennur Blackbuck Sanctuary & Bankapura',
    originLabel: 'Haveri, Karnataka',
  },
  {
    slug: 'kalaburagi',
    name: 'Kalaburagi',
    headquarters: 'Kalaburagi',
    region: 'Kalyana Karnataka',
    coordinates: [17.3297, 76.8343],
    highlight: 'Kalaburagi Fort, Haft Gumbaz & Sharana Basaveshwara Temple',
    originLabel: 'Kalaburagi, Karnataka',
  },
  {
    slug: 'kodagu',
    name: 'Kodagu',
    headquarters: 'Madikeri',
    region: 'Coastal & Malnad',
    coordinates: [12.4244, 75.7382],
    highlight: 'Abbey Falls, Raja’s Seat, Mandalpatti Ridge & Bylakuppe',
    originLabel: 'Kodagu (Madikeri), Karnataka',
  },
  {
    slug: 'kolar',
    name: 'Kolar',
    headquarters: 'Kolar',
    region: 'Southern Karnataka',
    coordinates: [13.1362, 78.1291],
    highlight: 'Antaragange Volcanic Caves, Kotilingeshwara & Kolaramma Temple',
    originLabel: 'Kolar, Karnataka',
  },
  {
    slug: 'koppal',
    name: 'Koppal',
    headquarters: 'Koppal',
    region: 'Kalyana Karnataka',
    coordinates: [15.3505, 76.1548],
    highlight: 'Anegundi Heritage Village, Anjanadri Hill & Mahadeva Temple Itagi',
    originLabel: 'Koppal, Karnataka',
  },
  {
    slug: 'mandya',
    name: 'Mandya',
    headquarters: 'Mandya',
    region: 'Southern Karnataka',
    coordinates: [12.5218, 76.8951],
    highlight: 'Srirangapatna Island Fort, Ranganathittu & Shivanasamudra Falls',
    originLabel: 'Mandya, Karnataka',
  },
  {
    slug: 'mysuru',
    name: 'Mysuru',
    headquarters: 'Mysuru',
    region: 'Southern Karnataka',
    coordinates: [12.2958, 76.6394],
    highlight: 'Mysuru Royal Palace, Chamundi Hill, Kabini & Somnathpura',
    originLabel: 'Mysuru, Karnataka',
  },
  {
    slug: 'raichur',
    name: 'Raichur',
    headquarters: 'Raichur',
    region: 'Kalyana Karnataka',
    coordinates: [16.212, 77.3439],
    highlight: 'Raichur Hill Fort, Maski Ashokan Edict & Ek Minar Mosque',
    originLabel: 'Raichur, Karnataka',
  },
  {
    slug: 'ramanagara',
    name: 'Ramanagara',
    headquarters: 'Ramanagara',
    region: 'Southern Karnataka',
    coordinates: [12.715, 77.2813],
    highlight: 'Ramadevara Betta Granite Hills, Janapada Loka & Mekedatu Gorge',
    originLabel: 'Ramanagara, Karnataka',
  },
  {
    slug: 'shivamogga',
    name: 'Shivamogga',
    headquarters: 'Shivamogga',
    region: 'Coastal & Malnad',
    coordinates: [13.9299, 75.5681],
    highlight: 'Jog Falls, Agumbe Rainforest Sunset & Sakrebailu Elephant Camp',
    originLabel: 'Shivamogga, Karnataka',
  },
  {
    slug: 'tumakuru',
    name: 'Tumakuru',
    headquarters: 'Tumakuru',
    region: 'Southern Karnataka',
    coordinates: [13.3379, 77.1173],
    highlight: 'Madhugiri Monolith Fort, Devarayanadurga & Siddaganga Hill',
    originLabel: 'Tumakuru, Karnataka',
  },
  {
    slug: 'udupi',
    name: 'Udupi',
    headquarters: 'Udupi',
    region: 'Coastal & Malnad',
    coordinates: [13.3409, 74.7421],
    highlight: 'Sri Krishna Matha, Malpe & St. Mary’s Island, Kaup Lighthouse',
    originLabel: 'Udupi, Karnataka',
  },
  {
    slug: 'uttara-kannada',
    name: 'Uttara Kannada',
    headquarters: 'Karwar',
    region: 'Coastal & Malnad',
    coordinates: [14.8136, 74.1297],
    highlight: 'Gokarna Om Beach, Murdeshwar, Dandeli Rapids & Yana Caves',
    originLabel: 'Uttara Kannada (Karwar), Karnataka',
  },
  {
    slug: 'vijayapura',
    name: 'Vijayapura',
    headquarters: 'Vijayapura',
    region: 'Kittur Karnataka',
    coordinates: [16.8302, 75.71],
    highlight: 'Gol Gumbaz Whispering Gallery, Ibrahim Rauza & Bara Kaman',
    originLabel: 'Vijayapura, Karnataka',
  },
  {
    slug: 'vijayanagara',
    name: 'Vijayanagara',
    headquarters: 'Hosapete',
    region: 'Kalyana Karnataka',
    coordinates: [15.2689, 76.3909],
    highlight: 'Hampi UNESCO Stone Chariot, Virupaksha Temple & Tungabhadra Dam',
    originLabel: 'Vijayanagara (Hosapete), Karnataka',
  },
  {
    slug: 'yadgir',
    name: 'Yadgir',
    headquarters: 'Yadgir',
    region: 'Kalyana Karnataka',
    coordinates: [16.77, 77.1376],
    highlight: 'Yadgir Hill Fort, Sleeping Buddha Hills (Shahpur) & Kodekal',
    originLabel: 'Yadgir, Karnataka',
  },
];

export const MAJOR_INDIAN_STARTING_CITIES: Array<{
  label: string;
  coordinates: [number, number];
}> = [
  { label: 'New Delhi', coordinates: [28.6139, 77.209] },
  { label: 'Mumbai', coordinates: [19.076, 72.8777] },
  { label: 'Chennai', coordinates: [13.0827, 80.2707] },
  { label: 'Kolkata', coordinates: [22.5726, 88.3639] },
  { label: 'Hyderabad', coordinates: [17.385, 78.4867] },
  { label: 'Pune', coordinates: [18.5204, 73.8567] },
  { label: 'Ahmedabad', coordinates: [23.0225, 72.5714] },
  { label: 'Jaipur', coordinates: [26.9124, 75.7873] },
  { label: 'Kochi', coordinates: [9.9312, 76.2673] },
];

export function resolveOriginCoordinates(startingLocation: string): [number, number] {
  const normalized = startingLocation.trim().toLowerCase();
  if (!normalized) return [12.9716, 77.5946];

  const districtMatch = KARNATAKA_DISTRICTS.find(
    (d) =>
      d.originLabel.toLowerCase() === normalized ||
      d.name.toLowerCase() === normalized ||
      d.headquarters.toLowerCase() === normalized ||
      normalized.includes(d.name.toLowerCase()) ||
      normalized.includes(d.headquarters.toLowerCase())
  );
  if (districtMatch) return districtMatch.coordinates;

  // Common alternate spellings in Karnataka
  if (normalized.includes('bangalore')) return [12.9716, 77.5946];
  if (normalized.includes('mangalore')) return [12.9141, 74.856];
  if (normalized.includes('mysore')) return [12.2958, 76.6394];
  if (normalized.includes('hubballi') || normalized.includes('hubli')) return [15.3647, 75.124];
  if (normalized.includes('belgaum')) return [15.8497, 74.4977];
  if (normalized.includes('gulbarga')) return [17.3297, 76.8343];
  if (normalized.includes('bijapur')) return [16.8302, 75.71];
  if (normalized.includes('bellary')) return [15.1394, 76.9214];
  if (normalized.includes('shimoga')) return [13.9299, 75.5681];
  if (normalized.includes('coorg')) return [12.4244, 75.7382];
  if (normalized.includes('chikmagalur')) return [13.3161, 75.772];

  const metroMatch = MAJOR_INDIAN_STARTING_CITIES.find(
    (c) => c.label.toLowerCase() === normalized || normalized.includes(c.label.toLowerCase())
  );
  if (metroMatch) return metroMatch.coordinates;

  return [12.9716, 77.5946];
}
