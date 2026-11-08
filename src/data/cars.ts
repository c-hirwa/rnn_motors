/**
 * RNN Motors stock list.
 *
 * To add a car: put its photos in /public/cars/ and add an entry below.
 * To mark a car sold or reserved: change `status`.
 * Leave `priceKes` / `mileageKm` as null to show "Price on request" / hide mileage.
 *
 * Specs are indicative manufacturer figures; confirm with the sales team.
 * (When a Postgres database is added later, this file becomes the seed data.)
 */

export type Category = "exotic" | "executive" | "utility";
export type Status = "available" | "reserved" | "sold";

export type Photo = { src: string; width: number; height: number; focus: string };

export type Car = {
  slug: string;
  make: string;
  model: string;
  year: number | null;
  category: Category;
  body: string;
  colour: string;
  interior?: string;
  engine?: string;
  power?: string;
  transmission?: string;
  drive?: string;
  fuel?: string;
  mileageKm: number | null;
  condition?: "new" | "foreign-used" | "locally-used";
  priceKes: number | null;
  status: Status;
  /** Shown in the home page slideshow. */
  featured?: boolean;
  /** Listed on the hire page. */
  forHire?: boolean;
  description: string;
  features?: string[];
  photos: Photo[];
  /** ISO date the car was listed; used for "Newest" sorting. */
  added: string;
};

const p = (file: string, width: number, height: number, focus = "50% 55%"): Photo => ({ src: `/cars/${file}`, width, height, focus });

export const CARS: Car[] = [
  {
    slug: "2022-aston-martin-dbx", make: "Aston Martin", model: "DBX", year: 2022, category: "exotic",
    body: "Performance SUV", colour: "Silver", engine: "4.0L twin-turbo V8", power: "542 hp", drive: "AWD",
    fuel: "Petrol", transmission: "9-speed automatic", mileageKm: null, priceKes: null, status: "available", featured: true,
    description: "Aston Martin's first SUV, still every bit a grand tourer. Hand-finished cabin, a V8 with real presence, and a shape that turns heads on James Gichuru Road.",
    features: ["Panoramic glass roof", "Hand-stitched leather interior", "Adaptive air suspension", "22-inch alloy wheels", "360° camera"],
    photos: [p("aston-martin-dbx.jpg", 1120, 1400, "50% 62%")], added: "2024-03-14",
  },
  {
    slug: "bentley-flying-spur-white", make: "Bentley", model: "Flying Spur", year: null, category: "exotic",
    body: "Luxury saloon", colour: "Glacier White", engine: "Twin-turbo", drive: "AWD", fuel: "Petrol", transmission: "Automatic",
    mileageKm: null, priceKes: null, status: "available", featured: true, forHire: true,
    description: "Our signature white Flying Spur, the car Nairobi books for weddings. Quilted hide, deep-pile carpets and a ride as calm as a lounge.",
    features: ["Quilted leather seats", "Rear-seat entertainment", "Deep-pile lambswool rugs", "Available for chauffeured hire"],
    photos: [p("bentley-flying-spur.jpg", 1400, 1205, "60% 55%")], added: "2024-03-13",
  },
  {
    slug: "mercedes-amg-g63-grey", make: "Mercedes-AMG", model: "G 63", year: null, category: "executive",
    body: "Performance SUV", colour: "Grey", engine: "4.0L biturbo V8", power: "577 hp", drive: "4MATIC", fuel: "Petrol",
    transmission: "9-speed automatic", mileageKm: null, priceKes: null, status: "available", featured: true, forHire: true,
    description: "The boxy icon with side-exit exhausts and three locking differentials. As comfortable at a Karen gala as on a Laikipia track.",
    features: ["Three locking differentials", "Side-exit exhausts", "Burmester sound", "Widescreen cockpit"],
    photos: [p("mercedes-g63.jpg", 1124, 1400)], added: "2024-03-12",
  },
  {
    slug: "2022-range-rover-vogue-autobiography", make: "Range Rover", model: "Vogue Autobiography", year: 2022, category: "executive",
    body: "Luxury SUV", colour: "Eiger Grey", engine: "Mild-hybrid", drive: "AWD", fuel: "Petrol", transmission: "8-speed automatic",
    mileageKm: null, priceKes: null, status: "available", featured: true,
    description: "The new-generation Range Rover in its top trim. Minimal lines and a quiet cabin, with real off-road ability underneath.",
    features: ["Executive rear seating", "Meridian Signature sound", "Air suspension", "Pixel LED headlights"],
    photos: [p("range-rover-autobiography.jpg", 1380, 1400, "50% 45%")], added: "2024-03-11",
  },
  {
    slug: "2022-range-rover-vogue-black", make: "Range Rover", model: "Vogue", year: 2022, category: "executive",
    body: "Luxury SUV", colour: "Black", engine: "Mild-hybrid", drive: "AWD", fuel: "Petrol", transmission: "8-speed automatic",
    mileageKm: null, priceKes: null, status: "available", forHire: true,
    description: "Blacked-out L460 Vogue. Presidential presence with the modern Range Rover's tech and air-suspension ride.",
    photos: [p("range-rover-vogue.jpg", 1120, 1400, "50% 65%")], added: "2024-03-10",
  },
  {
    slug: "2023-range-rover-sport-p400-white", make: "Range Rover", model: "Sport P400", year: 2023, category: "executive",
    body: "Sport SUV", colour: "Fuji White", engine: "3.0L I6 MHEV", power: "400 PS", drive: "AWD", fuel: "Petrol",
    transmission: "8-speed automatic", mileageKm: null, priceKes: null, status: "available",
    description: "The latest Range Rover Sport: sharper, lower and quicker. Six-cylinder mild hybrid with dynamic air suspension.",
    photos: [p("range-rover-sport-p400.jpg", 1400, 1278, "50% 60%")], added: "2024-03-09",
  },
  {
    slug: "2023-range-rover-sport-p400-black", make: "Range Rover", model: "Sport P400", year: 2023, category: "executive",
    body: "Sport SUV", colour: "Santorini Black", engine: "3.0L I6 MHEV", power: "400 PS", drive: "AWD", fuel: "Petrol",
    transmission: "8-speed automatic", mileageKm: null, priceKes: null, status: "available",
    description: "Same P400 recipe in all-black. Gloss trim, dark glass and a cabin full of tech.",
    photos: [p("range-rover-sport-p400-b.jpg", 1120, 1400, "50% 60%")], added: "2024-03-08",
  },
  {
    slug: "2021-mercedes-benz-s500-4matic", make: "Mercedes-Benz", model: "S 500 4MATIC", year: 2021, category: "executive",
    body: "Executive saloon", colour: "Emerald Black", engine: "3.0L I6 EQ Boost", power: "429 hp", drive: "4MATIC", fuel: "Petrol",
    transmission: "9-speed automatic", mileageKm: null, priceKes: null, status: "available", forHire: true,
    description: "The W223 S-Class, the benchmark executive car. Rear-seat comfort, ambient lighting and a ride that makes Nairobi traffic easier to bear.",
    photos: [p("mercedes-s500.jpg", 1394, 1400, "50% 60%")], added: "2024-03-07",
  },
  {
    slug: "2022-porsche-cayenne-s-platinum-edition", make: "Porsche", model: "Cayenne S Platinum Edition", year: 2022, category: "exotic",
    body: "Performance SUV", colour: "Jet Black", engine: "2.9L twin-turbo V6", power: "440 hp", drive: "AWD", fuel: "Petrol",
    transmission: "8-speed Tiptronic S", mileageKm: null, priceKes: null, status: "available",
    description: "Platinum Edition detailing over the Cayenne S's twin-turbo V6. A family SUV that drives like a Porsche.",
    photos: [p("porsche-cayenne-s-platinum.jpg", 1120, 1400, "50% 60%")], added: "2024-03-06",
  },
  {
    slug: "2023-porsche-cayenne-platinum-edition", make: "Porsche", model: "Cayenne Platinum Edition", year: 2023, category: "exotic",
    body: "Luxury SUV", colour: "Black", engine: "3.0L turbo V6", power: "335 hp", drive: "AWD", fuel: "Petrol",
    transmission: "8-speed Tiptronic S", mileageKm: null, priceKes: null, status: "available",
    description: "Satin-platinum wheels and trim, a panoramic roof and Porsche's 3.0 V6. Understated and very quick.",
    photos: [p("porsche-cayenne-platinum.jpg", 1400, 1088)], added: "2024-03-05",
  },
  {
    slug: "2022-mercedes-benz-gle-450-coupe", make: "Mercedes-Benz", model: "GLE 450 Coupé", year: 2022, category: "executive",
    body: "Coupé SUV", colour: "Polar White", engine: "3.0L I6 EQ Boost", power: "362 hp", drive: "4MATIC", fuel: "Petrol",
    transmission: "9-speed automatic", mileageKm: null, priceKes: null, status: "available",
    description: "Sloping roofline, diamond grille and smooth six-cylinder power. The stylish choice among big Mercedes SUVs.",
    photos: [p("mercedes-gle450-coupe.jpg", 1400, 1321)], added: "2024-03-04",
  },
  {
    slug: "2023-ford-ranger-raptor", make: "Ford", model: "Ranger Raptor", year: 2023, category: "utility",
    body: "Performance pickup", colour: "Conquer Grey", engine: "Twin-turbo", drive: "4×4", transmission: "10-speed automatic",
    mileageKm: null, priceKes: null, status: "available",
    description: "Fox Live Valve dampers, long-travel suspension and a properly aggressive stance. Built for murram as much as tarmac.",
    photos: [p("ford-ranger-raptor.jpg", 1120, 1400)], added: "2024-03-03",
  },
  {
    slug: "2015-toyota-land-cruiser-prado-tx", make: "Toyota", model: "Land Cruiser Prado TX", year: 2015, category: "utility",
    body: "4×4 SUV", colour: "Pearl White", drive: "4×4", mileageKm: null, priceKes: null, status: "available", forHire: true,
    description: "Kenya's favourite go-anywhere SUV. Seven seats and legendary Toyota reliability, ready for upcountry roads.",
    photos: [p("toyota-prado.jpg", 1400, 1275, "50% 60%")], added: "2024-03-02",
  },
  {
    slug: "2019-mercedes-benz-vito-220d", make: "Mercedes-Benz", model: "Vito 220d", year: 2019, category: "utility",
    body: "Executive van", colour: "Obsidian Black", engine: "2.1L turbo-diesel", drive: "RWD", fuel: "Diesel", transmission: "Automatic",
    mileageKm: null, priceKes: null, status: "available", forHire: true,
    description: "Seating for the whole group, in Mercedes comfort. Good for corporate shuttles, bridal parties and airport runs with luggage.",
    photos: [p("mercedes-vito.jpg", 1120, 1400, "50% 60%")], added: "2024-03-01",
  },
];
