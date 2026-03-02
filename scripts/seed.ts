import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

// ── Load .env ───────────────────────────────────────────────────────────────
const envPath = join(process.cwd(), ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const idx = line.indexOf("=");
  if (idx > 0) {
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key && val) process.env[key] = val;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) =>
  +(Math.random() * (max - min) + min).toFixed(6);

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Owner Data ──────────────────────────────────────────────────────────────
const OWNERS = [
  { first: "Rajesh", last: "Sharma", email: "rajesh.sharma@email.com", phone: "9876543210" },
  { first: "Priya", last: "Patel", email: "priya.patel@email.com", phone: "9823456781" },
  { first: "Amit", last: "Kumar", email: "amit.kumar@email.com", phone: "9812345670" },
  { first: "Sneha", last: "Deshmukh", email: "sneha.deshmukh@email.com", phone: "9845671230" },
  { first: "Vikram", last: "Singh", email: "vikram.singh@email.com", phone: "9867890123" },
  { first: "Anita", last: "Joshi", email: "anita.joshi@email.com", phone: "9890123456" },
  { first: "Suresh", last: "Patil", email: "suresh.patil@email.com", phone: "9801234567" },
  { first: "Deepa", last: "Nair", email: "deepa.nair@email.com", phone: "9834567890" },
  { first: "Rohit", last: "Mehta", email: "rohit.mehta@email.com", phone: "9856789012" },
  { first: "Kavita", last: "Reddy", email: "kavita.reddy@email.com", phone: "9878901234" },
  { first: "Sanjay", last: "Kulkarni", email: "sanjay.kulkarni@email.com", phone: "9887654321" },
  { first: "Pooja", last: "Gupta", email: "pooja.gupta@email.com", phone: "9843210987" },
  { first: "Manoj", last: "Tiwari", email: "manoj.tiwari@email.com", phone: "9854321098" },
  { first: "Arti", last: "Chavan", email: "arti.chavan@email.com", phone: "9865432109" },
  { first: "Nilesh", last: "Shinde", email: "nilesh.shinde@email.com", phone: "9876541098" },
  { first: "Sunita", last: "Pawar", email: "sunita.pawar@email.com", phone: "9898765432" },
  { first: "Rakesh", last: "Malhotra", email: "rakesh.malhotra@email.com", phone: "9832109876" },
  { first: "Neha", last: "Kapoor", email: "neha.kapoor@email.com", phone: "9821098765" },
  { first: "Ajay", last: "Bhosale", email: "ajay.bhosale@email.com", phone: "9810987654" },
  { first: "Meera", last: "Iyer", email: "meera.iyer@email.com", phone: "9809876543" },
];

// ── Locality Data ───────────────────────────────────────────────────────────
interface Locality {
  name: string;
  pincode: string;
  lat: number;
  lng: number;
}

const PUNE_LOCALITIES: Locality[] = [
  { name: "Hinjawadi", pincode: "411057", lat: 18.5912, lng: 73.7389 },
  { name: "Wakad", pincode: "411057", lat: 18.5986, lng: 73.7633 },
  { name: "Baner", pincode: "411045", lat: 18.5590, lng: 73.7868 },
  { name: "Kothrud", pincode: "411038", lat: 18.5074, lng: 73.8077 },
  { name: "Hadapsar", pincode: "411028", lat: 18.5089, lng: 73.9260 },
  { name: "Viman Nagar", pincode: "411014", lat: 18.5679, lng: 73.9143 },
  { name: "Kharadi", pincode: "411014", lat: 18.5530, lng: 73.9400 },
  { name: "Magarpatta", pincode: "411028", lat: 18.5148, lng: 73.9271 },
  { name: "Aundh", pincode: "411007", lat: 18.5581, lng: 73.8073 },
  { name: "Pimple Saudagar", pincode: "411027", lat: 18.5977, lng: 73.7997 },
  { name: "Koregaon Park", pincode: "411001", lat: 18.5362, lng: 73.8930 },
  { name: "Kalyani Nagar", pincode: "411006", lat: 18.5466, lng: 73.9020 },
  { name: "Shivaji Nagar", pincode: "411005", lat: 18.5308, lng: 73.8474 },
  { name: "Deccan", pincode: "411004", lat: 18.5163, lng: 73.8408 },
  { name: "Pashan", pincode: "411021", lat: 18.5363, lng: 73.7855 },
  { name: "Bavdhan", pincode: "411021", lat: 18.5167, lng: 73.7700 },
  { name: "Warje", pincode: "411058", lat: 18.4859, lng: 73.8005 },
  { name: "Sinhagad Road", pincode: "411041", lat: 18.4746, lng: 73.8221 },
  { name: "Kondhwa", pincode: "411048", lat: 18.4713, lng: 73.8890 },
  { name: "NIBM Road", pincode: "411048", lat: 18.4726, lng: 73.8984 },
  { name: "Undri", pincode: "411060", lat: 18.4600, lng: 73.9110 },
  { name: "Wanowrie", pincode: "411040", lat: 18.4897, lng: 73.8955 },
  { name: "Bibwewadi", pincode: "411037", lat: 18.4765, lng: 73.8647 },
  { name: "Katraj", pincode: "411046", lat: 18.4571, lng: 73.8586 },
  { name: "Yerawada", pincode: "411006", lat: 18.5562, lng: 73.8848 },
  { name: "Mundhwa", pincode: "411036", lat: 18.5367, lng: 73.9300 },
  { name: "Lohegaon", pincode: "411047", lat: 18.5926, lng: 73.9197 },
  { name: "Wagholi", pincode: "412207", lat: 18.5800, lng: 73.9700 },
  { name: "Chandan Nagar", pincode: "411014", lat: 18.5594, lng: 73.9312 },
  { name: "Vishrantwadi", pincode: "411015", lat: 18.5750, lng: 73.8850 },
  { name: "Dhanori", pincode: "411015", lat: 18.5957, lng: 73.8978 },
  { name: "Pimpri", pincode: "411018", lat: 18.6279, lng: 73.7997 },
  { name: "Chinchwad", pincode: "411019", lat: 18.6298, lng: 73.7868 },
  { name: "Akurdi", pincode: "411035", lat: 18.6476, lng: 73.7691 },
  { name: "Nigdi", pincode: "411044", lat: 18.6520, lng: 73.7570 },
  { name: "Ravet", pincode: "412101", lat: 18.6472, lng: 73.7370 },
  { name: "Tathawade", pincode: "411033", lat: 18.6103, lng: 73.7469 },
  { name: "Balewadi", pincode: "411045", lat: 18.5678, lng: 73.7764 },
  { name: "Sus", pincode: "411021", lat: 18.5468, lng: 73.7545 },
  { name: "Ambegaon", pincode: "411046", lat: 18.4500, lng: 73.8450 },
];

const MUMBAI_LOCALITIES: Locality[] = [
  { name: "Andheri West", pincode: "400053", lat: 19.1361, lng: 72.8296 },
  { name: "Andheri East", pincode: "400069", lat: 19.1197, lng: 72.8547 },
  { name: "Bandra West", pincode: "400050", lat: 19.0596, lng: 72.8295 },
  { name: "Bandra East", pincode: "400051", lat: 19.0587, lng: 72.8470 },
  { name: "Juhu", pincode: "400049", lat: 19.0883, lng: 72.8263 },
  { name: "Goregaon East", pincode: "400063", lat: 19.1663, lng: 72.8526 },
  { name: "Goregaon West", pincode: "400062", lat: 19.1560, lng: 72.8370 },
  { name: "Malad West", pincode: "400064", lat: 19.1867, lng: 72.8312 },
  { name: "Malad East", pincode: "400097", lat: 19.1870, lng: 72.8548 },
  { name: "Borivali West", pincode: "400092", lat: 19.2288, lng: 72.8417 },
  { name: "Borivali East", pincode: "400066", lat: 19.2322, lng: 72.8572 },
  { name: "Powai", pincode: "400076", lat: 19.1176, lng: 72.9060 },
  { name: "Kandivali West", pincode: "400067", lat: 19.2040, lng: 72.8370 },
  { name: "Kandivali East", pincode: "400101", lat: 19.2096, lng: 72.8562 },
  { name: "Dadar", pincode: "400014", lat: 19.0178, lng: 72.8478 },
  { name: "Worli", pincode: "400018", lat: 19.0168, lng: 72.8154 },
  { name: "Lower Parel", pincode: "400013", lat: 18.9973, lng: 72.8265 },
  { name: "Colaba", pincode: "400005", lat: 18.9067, lng: 72.8147 },
  { name: "Nariman Point", pincode: "400021", lat: 18.9254, lng: 72.8233 },
  { name: "BKC", pincode: "400051", lat: 19.0600, lng: 72.8650 },
  { name: "Kurla", pincode: "400070", lat: 19.0726, lng: 72.8794 },
  { name: "Ghatkopar", pincode: "400077", lat: 19.0860, lng: 72.9080 },
  { name: "Vikhroli", pincode: "400079", lat: 19.1102, lng: 72.9228 },
  { name: "Mulund", pincode: "400080", lat: 19.1726, lng: 72.9565 },
  { name: "Thane West", pincode: "400601", lat: 19.2183, lng: 72.9781 },
  { name: "Thane East", pincode: "400603", lat: 19.1930, lng: 72.9740 },
  { name: "Navi Mumbai", pincode: "400703", lat: 19.0330, lng: 73.0297 },
  { name: "Panvel", pincode: "410206", lat: 18.9894, lng: 73.1175 },
  { name: "Kharghar", pincode: "410210", lat: 19.0474, lng: 73.0603 },
  { name: "Vashi", pincode: "400703", lat: 19.0771, lng: 73.0015 },
  { name: "Nerul", pincode: "400706", lat: 19.0330, lng: 73.0159 },
  { name: "Belapur", pincode: "400614", lat: 19.0235, lng: 73.0385 },
  { name: "Airoli", pincode: "400708", lat: 19.1560, lng: 73.0007 },
  { name: "Chembur", pincode: "400071", lat: 19.0522, lng: 72.8939 },
  { name: "Wadala", pincode: "400031", lat: 19.0176, lng: 72.8617 },
  { name: "Sion", pincode: "400022", lat: 19.0454, lng: 72.8625 },
  { name: "Matunga", pincode: "400019", lat: 19.0273, lng: 72.8558 },
  { name: "Santacruz West", pincode: "400054", lat: 19.0843, lng: 72.8382 },
  { name: "Santacruz East", pincode: "400055", lat: 19.0821, lng: 72.8520 },
  { name: "Khar West", pincode: "400052", lat: 19.0715, lng: 72.8340 },
  { name: "Versova", pincode: "400061", lat: 19.1310, lng: 72.8138 },
  { name: "Ghansoli", pincode: "400701", lat: 19.1165, lng: 73.0077 },
];

// ── Property Images ─────────────────────────────────────────────────────────
const RESIDENTIAL_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
  "https://images.unsplash.com/photo-1560185127-6a86e3dda5b5?w=800&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
  "https://images.unsplash.com/photo-1560440021-33f9b867899d?w=800&q=80",
  "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
];

const COMMERCIAL_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
  "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80",
];

// ── Amenities ───────────────────────────────────────────────────────────────
const RESIDENTIAL_AMENITIES = [
  "Gym", "Swimming Pool", "Power Backup", "Lift", "24x7 Security", "CCTV",
  "Covered Parking", "Club House", "Children's Play Area", "Garden",
  "Intercom", "24x7 Water Supply", "Rain Water Harvesting", "Fire Safety",
  "Jogging Track", "Indoor Games", "Visitors Parking", "Maintenance Staff",
  "Gas Pipeline", "Waste Disposal", "Solar Power", "EV Charging",
  "Yoga/Meditation Area", "Pet Friendly", "Gated Community", "Vastu Compliant",
];

const COMMERCIAL_AMENITIES = [
  "Power Backup", "Lift", "24x7 Security", "CCTV", "Covered Parking",
  "Conference Room", "Cafeteria", "Fire Safety", "Visitors Parking",
  "Central AC", "High Speed Internet", "Reception Area", "Housekeeping",
  "Pantry", "Server Room", "UPS", "Waste Disposal", "Water Supply",
];

const PG_AMENITIES = [
  "WiFi", "Meals Included", "Power Backup", "AC", "Laundry",
  "Housekeeping", "Hot Water", "TV", "Refrigerator", "Washing Machine",
  "Water Purifier", "CCTV", "Security", "Parking", "Gym Access",
];

// ── Address Components ──────────────────────────────────────────────────────
const PUNE_LANDMARKS = [
  "Near Hinjawadi IT Park", "Opposite Amanora Mall", "Near Chandni Chowk",
  "Near Symbiosis Institute", "Opposite Magarpatta City", "Near EON IT Park",
  "Behind ICC Trade Tower", "Near Pune University", "Opposite Westend Mall",
  "Near Aga Khan Palace", "Opposite Phoenix Mall", "Near Senapati Bapat Road",
  "Near Kothrud Bus Stand", "Opposite City Pride Cinema", "Near MIT College",
  "Behind Persistent Systems", "Near Baner Highway", "Opposite Balewadi Stadium",
  "Near Hinjawadi Phase 3", "Near Wakad Bridge",
];

const MUMBAI_LANDMARKS = [
  "Near Andheri Station", "Opposite Infinity Mall", "Near Powai Lake",
  "Near Hiranandani Gardens", "Opposite Oberoi Mall", "Near BKC Metro",
  "Behind Bandra Kurla Complex", "Near Juhu Beach", "Opposite R City Mall",
  "Near Thane Station", "Near Phoenix Market City", "Opposite Inorbit Mall",
  "Near SEEPZ", "Near Goregaon Film City", "Behind Mindspace Airoli",
  "Near Vashi Railway Station", "Opposite Raghuleela Mall", "Near Colaba Causeway",
  "Near Marine Drive", "Near Bandra Bandstand",
];

const ROAD_NAMES_PUNE = [
  "Pune-Mumbai Expressway", "Pashan Road", "NIBM Road", "Sinhagad Road",
  "Karve Road", "FC Road", "JM Road", "Baner Road", "Aundh Road",
  "Senapati Bapat Road", "University Road", "Ganeshkhind Road",
  "Paud Road", "Satara Road", "Solapur Road", "Nagar Road",
];

const ROAD_NAMES_MUMBAI = [
  "SV Road", "Link Road", "Western Express Highway", "Eastern Express Highway",
  "Carter Road", "Hill Road", "Turner Road", "Juhu Tara Road",
  "Palm Beach Road", "Sion-Panvel Expressway", "LBS Marg", "Andheri-Kurla Road",
  "Linking Road", "JP Road", "MG Road", "Cadell Road",
];

// ── Societies & Buildings ───────────────────────────────────────────────────
const PUNE_SOCIETIES = [
  "Lodha Belmondo", "Godrej Infinity", "Marvel Fria", "Kumar Palmspring",
  "Kolte Patil Life Republic", "VTP Blue Waters", "Rohan Iksha",
  "Gera World of Joy", "Nyati Elan", "Pride Purple Park Street",
  "Kohinoor Grandeur", "Bramha Skycity", "Paranjape Blue Ridge",
  "Shapoorji Pallonji Sensorium", "Panchshil Towers", "Amanora Park Town",
  "Blue Ridge Society", "Megapolis Splendour", "Kalpataru Serenity",
  "Marvel Cerise", "Pristine Prolife", "Goel Ganga Acropolis",
  "Naiknavare Dwarka", "Vascon Xotech", "Amit Bloomfield",
  "DSK Vishwa", "Mittal Brothers Sun Empire", "Venkatesh Sharvil",
  "Mantra Montana", "Kasturi Apostrophe",
];

const MUMBAI_SOCIETIES = [
  "Lodha World One", "Hiranandani Heritage", "Oberoi Realty Springs",
  "Godrej Platinum", "Rustomjee Crown", "Runwal Forest",
  "Kalpataru Avana", "L&T Emerald Isle", "Raheja Atlantis",
  "Dosti Vihar", "Neptune Living Point", "Wadhwa Wise City",
  "Marathon Nexzone", "Nahar Amrit Shakti", "Kanakia Paris",
  "Sunteck City", "Indiabulls Greens", "Raymond Realty Ten X Habitat",
  "Shapoorji Pallonji Joyville", "Hiranandani Meadows",
  "Lodha Palava City", "Dosti Imperia", "Paradise Sai Spring",
  "Hubtown Seasons", "Omkar Alta Monte", "Rustomjee Urbania",
  "JP North", "Puraniks Rumah Bali", "Balaji Delta Tower",
  "Kanakia Rainforest",
];

// ── Price & Spec Generators ─────────────────────────────────────────────────
interface PriceRange {
  min: number;
  max: number;
}

const RENT_PRICES: Record<string, Record<number, PriceRange>> = {
  Pune: {
    1: { min: 8000, max: 18000 },
    2: { min: 14000, max: 35000 },
    3: { min: 22000, max: 55000 },
    4: { min: 35000, max: 80000 },
  },
  Mumbai: {
    1: { min: 15000, max: 40000 },
    2: { min: 28000, max: 75000 },
    3: { min: 45000, max: 150000 },
    4: { min: 70000, max: 250000 },
  },
};

const SELL_PRICES: Record<string, Record<number, PriceRange>> = {
  Pune: {
    1: { min: 2500000, max: 5500000 },
    2: { min: 4500000, max: 12000000 },
    3: { min: 7500000, max: 22000000 },
    4: { min: 15000000, max: 45000000 },
  },
  Mumbai: {
    1: { min: 5000000, max: 15000000 },
    2: { min: 10000000, max: 35000000 },
    3: { min: 20000000, max: 70000000 },
    4: { min: 40000000, max: 150000000 },
  },
};

const AREA_RANGES: Record<number, PriceRange> = {
  1: { min: 400, max: 650 },
  2: { min: 650, max: 1200 },
  3: { min: 1000, max: 1800 },
  4: { min: 1500, max: 3500 },
};

function getRentPrice(city: string, bhk: number): number {
  const range = RENT_PRICES[city]?.[Math.min(bhk, 4)] ?? { min: 10000, max: 40000 };
  return Math.round(randInt(range.min, range.max) / 500) * 500;
}

function getSellPrice(city: string, bhk: number): number {
  const range = SELL_PRICES[city]?.[Math.min(bhk, 4)] ?? { min: 5000000, max: 20000000 };
  return Math.round(randInt(range.min, range.max) / 100000) * 100000;
}

function getArea(bhk: number): number {
  const range = AREA_RANGES[Math.min(bhk, 4)] ?? { min: 800, max: 2000 };
  return Math.round(randInt(range.min, range.max) / 10) * 10;
}

// ── Title & Description Generators ──────────────────────────────────────────
function residentialRentTitle(bhk: number, type: string, locality: string): string {
  const templates = [
    `Spacious ${bhk} BHK ${type} for Rent in ${locality}`,
    `Well-maintained ${bhk} BHK ${type} in ${locality}`,
    `Beautiful ${bhk} BHK ${type} Available for Rent in ${locality}`,
    `${bhk} BHK ${type} for Rent near ${locality}`,
    `Furnished ${bhk} BHK ${type} in ${locality}`,
    `Premium ${bhk} BHK ${type} for Rent in ${locality}`,
    `Lovely ${bhk} BHK ${type} in Prime ${locality} Location`,
    `${bhk} BHK ${type} in Gated Community - ${locality}`,
    `Affordable ${bhk} BHK ${type} in ${locality}`,
    `Bright & Airy ${bhk} BHK ${type} for Rent in ${locality}`,
  ];
  return pick(templates);
}

function residentialSellTitle(bhk: number, type: string, locality: string): string {
  const templates = [
    `${bhk} BHK ${type} for Sale in ${locality}`,
    `Luxurious ${bhk} BHK ${type} in ${locality}`,
    `Brand New ${bhk} BHK ${type} for Sale in ${locality}`,
    `${bhk} BHK ${type} with Modern Amenities in ${locality}`,
    `Resale ${bhk} BHK ${type} in ${locality}`,
    `Premium ${bhk} BHK ${type} for Sale in ${locality}`,
    `Well-designed ${bhk} BHK ${type} in ${locality}`,
    `${bhk} BHK ${type} in Top Society - ${locality}`,
    `Vastu Compliant ${bhk} BHK ${type} in ${locality}`,
    `Ready to Move ${bhk} BHK ${type} for Sale in ${locality}`,
  ];
  return pick(templates);
}

function commercialTitle(type: string, locality: string, purpose: string): string {
  const forText = purpose === "sell" ? "for Sale" : "for Rent";
  const templates = [
    `Prime ${type} Space ${forText} in ${locality}`,
    `${type} ${forText} in Commercial Hub - ${locality}`,
    `Well-located ${type} Space ${forText} in ${locality}`,
    `Furnished ${type} ${forText} in ${locality}`,
    `${type} in Premium Business Park - ${locality}`,
    `Spacious ${type} ${forText} at ${locality}`,
  ];
  return pick(templates);
}

function pgTitle(locality: string, city: string): string {
  const templates = [
    `PG Accommodation in ${locality}, ${city}`,
    `Boys/Girls PG in ${locality} - ${city}`,
    `Furnished PG with Meals in ${locality}`,
    `Premium PG Accommodation near ${locality}`,
    `Budget-friendly PG in ${locality}, ${city}`,
    `AC PG with Food in ${locality}`,
  ];
  return pick(templates);
}

function generateDescription(
  purpose: string,
  type: string,
  bhk: number | undefined,
  locality: string,
  city: string,
  area: number | undefined,
  furnishing: string,
  amenities: string[]
): string {
  const bhkText = bhk ? `${bhk} BHK` : "";
  const furnText =
    furnishing === "fully"
      ? "fully furnished"
      : furnishing === "semi"
      ? "semi-furnished"
      : "unfurnished";

  const purposeTexts: Record<string, string> = {
    rent: "available for rent",
    sell: "available for sale",
    pg: "offering PG accommodation",
    lease: "available for lease",
  };

  const intros = [
    `This well-maintained ${bhkText} ${type} in ${locality}, ${city} is ${purposeTexts[purpose] ?? "available"}.`,
    `Located in the heart of ${locality}, this ${bhkText} ${type} offers a comfortable living experience.`,
    `A premium ${bhkText} ${type} situated in ${locality}, one of ${city}'s most sought-after neighborhoods.`,
    `This ${furnText} ${bhkText} ${type} in ${locality} is perfect for families and professionals.`,
  ];

  const middles = [
    area
      ? `The property spans ${area} sqft of carpet area with well-planned rooms and ample natural light.`
      : `The property features well-planned rooms with ample natural light and ventilation.`,
    `It is located in close proximity to schools, hospitals, shopping centers, and public transportation.`,
    `The society is well-maintained with round-the-clock security and excellent amenities.`,
    `${locality} is well-connected to major IT hubs, commercial areas, and entertainment zones in ${city}.`,
  ];

  const amenitiesText =
    amenities.length > 0
      ? `Key amenities include ${amenities.slice(0, 5).join(", ")}, and more.`
      : "";

  const closes = [
    `Ideal for ${purpose === "rent" ? "working professionals and families" : "investment and self-use"}.`,
    `Don't miss this opportunity to ${purpose === "rent" ? "rent" : "own"} a property in ${locality}.`,
    `Contact now for a site visit. Zero brokerage - deal directly with the owner.`,
  ];

  return [pick(intros), pick(middles), amenitiesText, pick(closes)]
    .filter(Boolean)
    .join(" ");
}

// ── Property Generation ─────────────────────────────────────────────────────
interface PropertyDoc {
  slug: string;
  listedBy: mongoose.Types.ObjectId;
  listingType: string;
  purpose: string;
  category: string;
  propertyType: string;
  title: string;
  description: string;
  price: Record<string, unknown>;
  specs: Record<string, unknown>;
  amenities: string[];
  location: Record<string, unknown>;
  media: Record<string, unknown>;
  status: string;
  featured: Record<string, unknown>;
  metrics: Record<string, unknown>;
  publishedAt: Date;
}

let slugCounter = 0;

function generateResidentialRent(
  ownerIds: mongoose.Types.ObjectId[],
  city: string,
  localities: Locality[],
  societies: string[],
  landmarks: string[],
  roads: string[]
): PropertyDoc {
  const locality = pick(localities);
  const bhk = pick([1, 1, 2, 2, 2, 3, 3, 3, 4]);
  const type = bhk <= 2 ? pick(["Flat", "Flat", "Flat", "Apartment"]) : pick(["Flat", "Apartment", "House"]);
  const propertyType = type === "House" ? "house" : "flat";
  const furnishing = pick(["unfurnished", "unfurnished", "semi", "semi", "fully"]) as string;
  const area = getArea(bhk);
  const price = getRentPrice(city, bhk);
  const amenities = pickN(RESIDENTIAL_AMENITIES, randInt(5, 12));
  const title = residentialRentTitle(bhk, type, locality.name);
  const society = pick(societies);
  const facing = pick(["north", "south", "east", "west", "ne", "nw", "se", "sw"]);
  const age = pick(["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"]);
  const images = pickN(RESIDENTIAL_IMAGES, randInt(3, 5));
  slugCounter++;

  return {
    slug: `${slugify(title)}-${slugCounter}`,
    listedBy: pick(ownerIds),
    listingType: pick(["owner", "owner", "owner", "agent"]),
    purpose: "rent",
    category: "residential",
    propertyType,
    title,
    description: generateDescription("rent", type, bhk, locality.name, city, area, furnishing, amenities),
    price: {
      amount: price,
      currency: "INR",
      negotiable: Math.random() > 0.6,
      maintenance: Math.round(randInt(1500, 6000) / 500) * 500,
      deposit: price * pick([2, 2, 3, 3, 6, 10]),
    },
    specs: {
      bedrooms: bhk,
      bathrooms: bhk <= 2 ? bhk : bhk - 1 + (Math.random() > 0.5 ? 1 : 0),
      balconies: randInt(1, Math.min(bhk, 3)),
      totalFloors: randInt(4, 25),
      floorNumber: randInt(1, 20),
      facing,
      furnishing,
      parking: { covered: randInt(0, 2), open: randInt(0, 1) },
      area: { carpet: area, builtUp: Math.round(area * 1.15), superBuiltUp: Math.round(area * 1.3), unit: "sqft" },
      age,
      possessionStatus: "ready",
    },
    amenities,
    location: {
      address: {
        line1: `${society}, ${pick(roads)}`,
        line2: `${locality.name}, ${city}`,
        landmark: pick(landmarks),
      },
      locality: locality.name,
      city,
      state: "Maharashtra",
      pincode: locality.pincode,
      coordinates: {
        type: "Point",
        coordinates: [
          locality.lng + randFloat(-0.005, 0.005),
          locality.lat + randFloat(-0.005, 0.005),
        ],
      },
    },
    media: {
      images: images.map((url, i) => ({
        url,
        publicId: `seed/prop_${slugCounter}_img_${i}`,
        caption: i === 0 ? "Main View" : `View ${i + 1}`,
        isPrimary: i === 0,
        order: i,
      })),
    },
    status: "active",
    featured: {
      isFeatured: Math.random() > 0.85,
      ...(Math.random() > 0.85 ? { featuredUntil: new Date(Date.now() + 30 * 86400000) } : {}),
    },
    metrics: {
      views: randInt(10, 5000),
      uniqueViews: randInt(5, 3000),
      inquiries: randInt(0, 50),
      favorites: randInt(0, 100),
      shares: randInt(0, 30),
      phoneReveals: randInt(0, 40),
    },
    publishedAt: new Date(Date.now() - randInt(1, 90) * 86400000),
  };
}

function generateResidentialSell(
  ownerIds: mongoose.Types.ObjectId[],
  city: string,
  localities: Locality[],
  societies: string[],
  landmarks: string[],
  roads: string[]
): PropertyDoc {
  const locality = pick(localities);
  const bhk = pick([1, 2, 2, 2, 3, 3, 3, 4, 4]);
  const type = pick(["Flat", "Flat", "Flat", "Apartment", "Villa", "House"]);
  let propertyType: string;
  if (type === "Villa") propertyType = "villa";
  else if (type === "House") propertyType = "house";
  else propertyType = "flat";
  const furnishing = pick(["unfurnished", "semi", "semi", "fully"]) as string;
  const area = getArea(bhk) + (type === "Villa" ? randInt(300, 800) : 0);
  const price = getSellPrice(city, bhk) + (type === "Villa" ? randInt(2000000, 10000000) : 0);
  const amenities = pickN(RESIDENTIAL_AMENITIES, randInt(5, 14));
  const title = residentialSellTitle(bhk, type, locality.name);
  const society = pick(societies);
  const facing = pick(["north", "south", "east", "west", "ne", "nw", "se", "sw"]);
  const age = pick(["New Construction", "0-1 years", "1-3 years", "3-5 years", "5-10 years"]);
  const possessionStatus = pick(["ready", "ready", "ready", "under_construction"]) as string;
  const images = pickN(RESIDENTIAL_IMAGES, randInt(3, 6));
  slugCounter++;

  return {
    slug: `${slugify(title)}-${slugCounter}`,
    listedBy: pick(ownerIds),
    listingType: pick(["owner", "owner", "agent", "builder"]),
    purpose: "sell",
    category: "residential",
    propertyType,
    title,
    description: generateDescription("sell", type, bhk, locality.name, city, area, furnishing, amenities),
    price: {
      amount: price,
      currency: "INR",
      pricePerSqft: Math.round(price / area),
      negotiable: Math.random() > 0.5,
    },
    specs: {
      bedrooms: bhk,
      bathrooms: bhk <= 2 ? bhk : bhk - 1 + (Math.random() > 0.5 ? 1 : 0),
      balconies: randInt(1, Math.min(bhk, 3)),
      totalFloors: type === "Villa" ? randInt(2, 4) : randInt(5, 30),
      floorNumber: type === "Villa" ? 0 : randInt(1, 25),
      facing,
      furnishing,
      parking: { covered: randInt(1, 2), open: randInt(0, 2) },
      area: { carpet: area, builtUp: Math.round(area * 1.15), superBuiltUp: Math.round(area * 1.3), unit: "sqft" },
      age,
      possessionStatus,
      ...(possessionStatus === "under_construction"
        ? { possessionDate: new Date(Date.now() + randInt(180, 720) * 86400000) }
        : {}),
    },
    amenities,
    location: {
      address: {
        line1: `${society}, ${pick(roads)}`,
        line2: `${locality.name}, ${city}`,
        landmark: pick(landmarks),
      },
      locality: locality.name,
      city,
      state: "Maharashtra",
      pincode: locality.pincode,
      coordinates: {
        type: "Point",
        coordinates: [
          locality.lng + randFloat(-0.005, 0.005),
          locality.lat + randFloat(-0.005, 0.005),
        ],
      },
    },
    media: {
      images: images.map((url, i) => ({
        url,
        publicId: `seed/prop_${slugCounter}_img_${i}`,
        caption: i === 0 ? "Main View" : `View ${i + 1}`,
        isPrimary: i === 0,
        order: i,
      })),
    },
    status: "active",
    featured: {
      isFeatured: Math.random() > 0.8,
      ...(Math.random() > 0.8 ? { featuredUntil: new Date(Date.now() + 30 * 86400000) } : {}),
    },
    metrics: {
      views: randInt(20, 8000),
      uniqueViews: randInt(10, 5000),
      inquiries: randInt(0, 80),
      favorites: randInt(0, 200),
      shares: randInt(0, 50),
      phoneReveals: randInt(0, 60),
    },
    publishedAt: new Date(Date.now() - randInt(1, 120) * 86400000),
  };
}

function generatePlot(
  ownerIds: mongoose.Types.ObjectId[],
  city: string,
  localities: Locality[],
  landmarks: string[],
  roads: string[]
): PropertyDoc {
  const locality = pick(localities);
  const plotArea = pick([1000, 1200, 1500, 2000, 2400, 3000, 4000, 5000]);
  const pricePerSqft = city === "Mumbai" ? randInt(15000, 60000) : randInt(5000, 25000);
  const price = plotArea * pricePerSqft;
  const title = pick([
    `Residential Plot for Sale in ${locality.name}`,
    `${plotArea} sqft Plot for Sale in ${locality.name}`,
    `NA Plot Available in ${locality.name}, ${city}`,
    `Corner Plot for Sale in ${locality.name}`,
    `Premium Plot in ${locality.name} - ${city}`,
  ]);
  const images = pickN(RESIDENTIAL_IMAGES.slice(5, 10), randInt(2, 3));
  slugCounter++;

  return {
    slug: `${slugify(title)}-${slugCounter}`,
    listedBy: pick(ownerIds),
    listingType: pick(["owner", "agent", "builder"]),
    purpose: "sell",
    category: "residential",
    propertyType: "plot",
    title,
    description: `This ${plotArea} sqft residential plot is available for sale in ${locality.name}, ${city}. The plot is located in a well-developed area with good connectivity to main roads and public transport. Clear title with all approvals in place. Ideal for building your dream home.`,
    price: {
      amount: price,
      currency: "INR",
      pricePerSqft,
      negotiable: Math.random() > 0.4,
    },
    specs: {
      area: { plot: plotArea, unit: "sqft" },
      facing: pick(["north", "south", "east", "west"]),
      possessionStatus: "ready",
    },
    amenities: pickN(["Water Supply", "Electricity", "Road Access", "Gated Community", "Boundary Wall", "Garden"], randInt(2, 4)),
    location: {
      address: {
        line1: `Survey No. ${randInt(10, 500)}, ${pick(roads)}`,
        line2: `${locality.name}, ${city}`,
        landmark: pick(landmarks),
      },
      locality: locality.name,
      city,
      state: "Maharashtra",
      pincode: locality.pincode,
      coordinates: {
        type: "Point",
        coordinates: [
          locality.lng + randFloat(-0.008, 0.008),
          locality.lat + randFloat(-0.008, 0.008),
        ],
      },
    },
    media: {
      images: images.map((url, i) => ({
        url,
        publicId: `seed/plot_${slugCounter}_img_${i}`,
        caption: i === 0 ? "Plot View" : `View ${i + 1}`,
        isPrimary: i === 0,
        order: i,
      })),
    },
    status: "active",
    featured: { isFeatured: Math.random() > 0.9 },
    metrics: {
      views: randInt(5, 2000),
      uniqueViews: randInt(3, 1200),
      inquiries: randInt(0, 30),
      favorites: randInt(0, 50),
      shares: randInt(0, 15),
      phoneReveals: randInt(0, 20),
    },
    publishedAt: new Date(Date.now() - randInt(1, 90) * 86400000),
  };
}

function generatePG(
  ownerIds: mongoose.Types.ObjectId[],
  city: string,
  localities: Locality[],
  landmarks: string[],
  roads: string[]
): PropertyDoc {
  const locality = pick(localities);
  const price = city === "Mumbai" ? randInt(6000, 25000) : randInt(4000, 15000);
  const title = pgTitle(locality.name, city);
  const amenities = pickN(PG_AMENITIES, randInt(5, 10));
  const images = pickN(RESIDENTIAL_IMAGES, randInt(3, 4));
  slugCounter++;

  return {
    slug: `${slugify(title)}-${slugCounter}`,
    listedBy: pick(ownerIds),
    listingType: "owner",
    purpose: "pg",
    category: "residential",
    propertyType: "pg",
    title,
    description: `Well-maintained PG accommodation in ${locality.name}, ${city}. ${pick(["Single", "Double", "Triple"])} sharing rooms available with ${pick(["attached", "common"])} bathroom. ${pick(["Meals included (breakfast & dinner).", "Food available at additional cost.", "Self-cooking allowed."])} ${pick(["Ideal for working professionals.", "Suitable for students and young professionals.", "Close to IT parks and commercial areas."])} Contact for room availability.`,
    price: {
      amount: Math.round(price / 500) * 500,
      currency: "INR",
      negotiable: false,
      maintenance: 0,
      deposit: price * 2,
    },
    specs: {
      bedrooms: 1,
      bathrooms: 1,
      furnishing: "fully",
      parking: { covered: 0, open: Math.random() > 0.5 ? 1 : 0 },
      area: { carpet: randInt(80, 200), unit: "sqft" },
    },
    amenities,
    location: {
      address: {
        line1: `${pick(["House No.", "Flat No.", "Room No."])} ${randInt(1, 50)}, ${pick(roads)}`,
        line2: `${locality.name}, ${city}`,
        landmark: pick(landmarks),
      },
      locality: locality.name,
      city,
      state: "Maharashtra",
      pincode: locality.pincode,
      coordinates: {
        type: "Point",
        coordinates: [
          locality.lng + randFloat(-0.005, 0.005),
          locality.lat + randFloat(-0.005, 0.005),
        ],
      },
    },
    media: {
      images: images.map((url, i) => ({
        url,
        publicId: `seed/pg_${slugCounter}_img_${i}`,
        caption: i === 0 ? "Room View" : `View ${i + 1}`,
        isPrimary: i === 0,
        order: i,
      })),
    },
    status: "active",
    featured: { isFeatured: false },
    metrics: {
      views: randInt(10, 3000),
      uniqueViews: randInt(5, 1800),
      inquiries: randInt(0, 40),
      favorites: randInt(0, 60),
      shares: randInt(0, 20),
      phoneReveals: randInt(0, 30),
    },
    publishedAt: new Date(Date.now() - randInt(1, 60) * 86400000),
  };
}

function generateCommercial(
  ownerIds: mongoose.Types.ObjectId[],
  city: string,
  localities: Locality[],
  landmarks: string[],
  roads: string[],
  purpose: "rent" | "sell"
): PropertyDoc {
  const locality = pick(localities);
  const propType = pick(["office", "office", "shop", "shop", "warehouse", "showroom"]) as string;
  const area = propType === "warehouse" ? randInt(1000, 5000) : randInt(200, 2000);
  const furnishing = pick(["unfurnished", "semi", "fully"]) as string;

  let price: number;
  if (purpose === "rent") {
    const rate = city === "Mumbai" ? randInt(40, 200) : randInt(20, 80);
    price = Math.round((area * rate) / 500) * 500;
  } else {
    const rate = city === "Mumbai" ? randInt(15000, 50000) : randInt(6000, 20000);
    price = area * rate;
  }

  const typeLabel = propType.charAt(0).toUpperCase() + propType.slice(1);
  const title = commercialTitle(typeLabel, locality.name, purpose);
  const amenities = pickN(COMMERCIAL_AMENITIES, randInt(4, 10));
  const images = pickN(COMMERCIAL_IMAGES, randInt(3, 5));
  slugCounter++;

  return {
    slug: `${slugify(title)}-${slugCounter}`,
    listedBy: pick(ownerIds),
    listingType: pick(["owner", "agent"]),
    purpose: purpose === "sell" ? "sell" : "lease",
    category: "commercial",
    propertyType: propType,
    title,
    description: `${typeLabel} space ${purpose === "rent" ? "available for rent/lease" : "for sale"} in ${locality.name}, ${city}. Total area: ${area} sqft. ${furnishing === "fully" ? "Fully furnished with all office infrastructure." : furnishing === "semi" ? "Semi-furnished with basic fittings." : "Bare shell available for customization."} The property is located in a prime commercial area with excellent footfall and connectivity. ${purpose === "rent" ? "Flexible lease terms available." : "Clear title with all commercial approvals."} Ideal for ${propType === "office" ? "IT companies, startups, and corporates" : propType === "shop" ? "retail businesses, showrooms, and restaurants" : propType === "warehouse" ? "storage, logistics, and distribution" : "display and retail operations"}.`,
    price: {
      amount: price,
      currency: "INR",
      pricePerSqft: Math.round(price / area),
      negotiable: Math.random() > 0.4,
      ...(purpose === "rent" ? { maintenance: Math.round(randInt(2000, 10000) / 500) * 500, deposit: price * pick([3, 6, 10]) } : {}),
    },
    specs: {
      totalFloors: randInt(2, 15),
      floorNumber: randInt(0, 12),
      furnishing,
      parking: { covered: randInt(1, 5), open: randInt(0, 5) },
      area: { carpet: area, builtUp: Math.round(area * 1.2), superBuiltUp: Math.round(area * 1.35), unit: "sqft" },
      possessionStatus: "ready",
    },
    amenities,
    location: {
      address: {
        line1: `${pick(["Unit", "Suite", "Space"])} ${randInt(1, 200)}, ${pick(roads)}`,
        line2: `${locality.name}, ${city}`,
        landmark: pick(landmarks),
      },
      locality: locality.name,
      city,
      state: "Maharashtra",
      pincode: locality.pincode,
      coordinates: {
        type: "Point",
        coordinates: [
          locality.lng + randFloat(-0.005, 0.005),
          locality.lat + randFloat(-0.005, 0.005),
        ],
      },
    },
    media: {
      images: images.map((url, i) => ({
        url,
        publicId: `seed/comm_${slugCounter}_img_${i}`,
        caption: i === 0 ? "Main View" : `View ${i + 1}`,
        isPrimary: i === 0,
        order: i,
      })),
    },
    status: "active",
    featured: { isFeatured: Math.random() > 0.85 },
    metrics: {
      views: randInt(10, 4000),
      uniqueViews: randInt(5, 2500),
      inquiries: randInt(0, 60),
      favorites: randInt(0, 80),
      shares: randInt(0, 25),
      phoneReveals: randInt(0, 45),
    },
    publishedAt: new Date(Date.now() - randInt(1, 90) * 86400000),
  };
}

// ── Main Seed Function ──────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected!");

  // Import models
  const User = (await import("../lib/db/models/User")).default;
  const Property = (await import("../lib/db/models/Property")).default;

  // Clean existing seed data
  console.log("Cleaning existing seed data...");
  await User.deleteMany({ email: { $regex: /@email\.com$/ } });
  await Property.deleteMany({ slug: { $regex: /^.*-\d+$/ } });
  console.log("Cleaned!");

  // Create owner users
  console.log("Creating owner users...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const ownerDocs = OWNERS.map((o) => ({
    email: o.email,
    password: hashedPassword,
    name: { first: o.first, last: o.last },
    phone: o.phone,
    role: "owner" as const,
  }));

  const createdUsers = await User.insertMany(ownerDocs);
  const ownerIds = createdUsers.map((u: any) => u._id);
  console.log(`Created ${ownerIds.length} owner users`);

  // Generate properties
  console.log("Generating properties...");
  const properties: PropertyDoc[] = [];

  // ── Pune properties ──
  // Residential Rent (100)
  for (let i = 0; i < 100; i++) {
    properties.push(
      generateResidentialRent(ownerIds, "Pune", PUNE_LOCALITIES, PUNE_SOCIETIES, PUNE_LANDMARKS, ROAD_NAMES_PUNE)
    );
  }
  // Residential Sell (70)
  for (let i = 0; i < 70; i++) {
    properties.push(
      generateResidentialSell(ownerIds, "Pune", PUNE_LOCALITIES, PUNE_SOCIETIES, PUNE_LANDMARKS, ROAD_NAMES_PUNE)
    );
  }
  // Plots (15)
  for (let i = 0; i < 15; i++) {
    properties.push(generatePlot(ownerIds, "Pune", PUNE_LOCALITIES, PUNE_LANDMARKS, ROAD_NAMES_PUNE));
  }
  // PG (25)
  for (let i = 0; i < 25; i++) {
    properties.push(generatePG(ownerIds, "Pune", PUNE_LOCALITIES, PUNE_LANDMARKS, ROAD_NAMES_PUNE));
  }
  // Commercial Rent (20)
  for (let i = 0; i < 20; i++) {
    properties.push(
      generateCommercial(ownerIds, "Pune", PUNE_LOCALITIES, PUNE_LANDMARKS, ROAD_NAMES_PUNE, "rent")
    );
  }
  // Commercial Sell (10)
  for (let i = 0; i < 10; i++) {
    properties.push(
      generateCommercial(ownerIds, "Pune", PUNE_LOCALITIES, PUNE_LANDMARKS, ROAD_NAMES_PUNE, "sell")
    );
  }

  // ── Mumbai properties ──
  // Residential Rent (110)
  for (let i = 0; i < 110; i++) {
    properties.push(
      generateResidentialRent(ownerIds, "Mumbai", MUMBAI_LOCALITIES, MUMBAI_SOCIETIES, MUMBAI_LANDMARKS, ROAD_NAMES_MUMBAI)
    );
  }
  // Residential Sell (80)
  for (let i = 0; i < 80; i++) {
    properties.push(
      generateResidentialSell(ownerIds, "Mumbai", MUMBAI_LOCALITIES, MUMBAI_SOCIETIES, MUMBAI_LANDMARKS, ROAD_NAMES_MUMBAI)
    );
  }
  // Plots (10)
  for (let i = 0; i < 10; i++) {
    properties.push(generatePlot(ownerIds, "Mumbai", MUMBAI_LOCALITIES, MUMBAI_LANDMARKS, ROAD_NAMES_MUMBAI));
  }
  // PG (30)
  for (let i = 0; i < 30; i++) {
    properties.push(generatePG(ownerIds, "Mumbai", MUMBAI_LOCALITIES, MUMBAI_LANDMARKS, ROAD_NAMES_MUMBAI));
  }
  // Commercial Rent (25)
  for (let i = 0; i < 25; i++) {
    properties.push(
      generateCommercial(ownerIds, "Mumbai", MUMBAI_LOCALITIES, MUMBAI_LANDMARKS, ROAD_NAMES_MUMBAI, "rent")
    );
  }
  // Commercial Sell (15)
  for (let i = 0; i < 15; i++) {
    properties.push(
      generateCommercial(ownerIds, "Mumbai", MUMBAI_LOCALITIES, MUMBAI_LANDMARKS, ROAD_NAMES_MUMBAI, "sell")
    );
  }

  console.log(`Generated ${properties.length} properties. Inserting...`);

  // Batch insert (100 at a time)
  const BATCH_SIZE = 100;
  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);
    await Property.insertMany(batch);
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, properties.length)} / ${properties.length}`);
  }

  console.log("\n=== Seed Complete ===");
  console.log(`  Owners: ${ownerIds.length}`);
  console.log(`  Properties: ${properties.length}`);
  console.log(`    Pune: ${properties.filter((p) => (p.location as any).city === "Pune").length}`);
  console.log(`    Mumbai: ${properties.filter((p) => (p.location as any).city === "Mumbai").length}`);
  console.log(`    Rent: ${properties.filter((p) => p.purpose === "rent").length}`);
  console.log(`    Sell: ${properties.filter((p) => p.purpose === "sell").length}`);
  console.log(`    PG: ${properties.filter((p) => p.purpose === "pg").length}`);
  console.log(`    Lease (Commercial): ${properties.filter((p) => p.purpose === "lease").length}`);
  console.log(`    Residential: ${properties.filter((p) => p.category === "residential").length}`);
  console.log(`    Commercial: ${properties.filter((p) => p.category === "commercial").length}`);

  await mongoose.disconnect();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
