/**
 * Seeds the local database with RNN's current stock and the first admin account.
 *   npm run db:seed            → adds anything missing
 *   npm run db:seed -- --reset → wipes cars/photos/enquiries first
 *
 * Specs are indicative manufacturer figures; prices and mileage are left blank
 * for the sales team to fill in from the admin panel.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const db = new PrismaClient();
const IMG_DIR = path.join(__dirname, "seed-images");
const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

type SeedCar = {
  slug: string; make: string; model: string; year?: number; category: string; body: string; colour: string;
  engine?: string; power?: string; drive?: string; fuel?: string; transmission?: string; condition?: string;
  img: string; focus: string; description: string; features?: string[]; featured?: boolean; forHire?: boolean;
};

const CARS: SeedCar[] = [
  { slug: "2022-aston-martin-dbx", make: "Aston Martin", model: "DBX", year: 2022, category: "exotic", body: "Performance SUV", colour: "Silver",
    engine: "4.0L twin-turbo V8", power: "542 hp", drive: "AWD", fuel: "Petrol", transmission: "9-speed automatic",
    img: "aston-martin-dbx.jpg", focus: "50% 62%", featured: true,
    description: "Aston Martin's first SUV, still every bit a grand tourer. Hand-finished cabin, a V8 with real presence, and a shape that turns heads on James Gichuru Road.",
    features: ["Panoramic glass roof", "Hand-stitched leather interior", "Adaptive air suspension", "22-inch alloy wheels", "360° camera"] },
  { slug: "bentley-flying-spur-white", make: "Bentley", model: "Flying Spur", category: "exotic", body: "Luxury saloon", colour: "Glacier White",
    engine: "Twin-turbo", drive: "AWD", fuel: "Petrol", transmission: "Automatic",
    img: "bentley-flying-spur.jpg", focus: "60% 55%", featured: true, forHire: true,
    description: "Our signature white Flying Spur, the car Nairobi books for weddings. Quilted hide, deep-pile carpets and a ride as calm as a lounge.",
    features: ["Quilted leather seats", "Rear-seat entertainment", "Deep-pile lambswool rugs", "Available for chauffeured hire"] },
  { slug: "mercedes-amg-g63-grey", make: "Mercedes-AMG", model: "G 63", category: "executive", body: "Performance SUV", colour: "Grey",
    engine: "4.0L biturbo V8", power: "577 hp", drive: "4MATIC", fuel: "Petrol", transmission: "9-speed automatic",
    img: "mercedes-g63.jpg", focus: "50% 55%", featured: true, forHire: true,
    description: "The boxy icon with side-exit exhausts and three locking differentials. As comfortable at a Karen gala as on a Laikipia track.",
    features: ["Three locking differentials", "Side-exit exhausts", "Burmester sound", "Widescreen cockpit"] },
  { slug: "2022-range-rover-vogue-autobiography", make: "Range Rover", model: "Vogue Autobiography", year: 2022, category: "executive", body: "Luxury SUV", colour: "Eiger Grey",
    engine: "Mild-hybrid", drive: "AWD", fuel: "Petrol", transmission: "8-speed automatic",
    img: "range-rover-autobiography.jpg", focus: "50% 45%", featured: true,
    description: "The new-generation Range Rover in its top trim. Minimal lines and a quiet cabin, with real off-road ability underneath.",
    features: ["Executive rear seating", "Meridian Signature sound", "Air suspension", "Pixel LED headlights"] },
  { slug: "2022-range-rover-vogue-black", make: "Range Rover", model: "Vogue", year: 2022, category: "executive", body: "Luxury SUV", colour: "Black",
    engine: "Mild-hybrid", drive: "AWD", fuel: "Petrol", transmission: "8-speed automatic",
    img: "range-rover-vogue.jpg", focus: "50% 65%", forHire: true,
    description: "Blacked-out L460 Vogue. Presidential presence with the modern Range Rover's tech and air-suspension ride." },
  { slug: "2023-range-rover-sport-p400-white", make: "Range Rover", model: "Sport P400", year: 2023, category: "executive", body: "Sport SUV", colour: "Fuji White",
    engine: "3.0L I6 MHEV", power: "400 PS", drive: "AWD", fuel: "Petrol", transmission: "8-speed automatic",
    img: "range-rover-sport-p400.jpg", focus: "50% 60%",
    description: "The latest Range Rover Sport: sharper, lower and quicker. Six-cylinder mild hybrid with dynamic air suspension." },
  { slug: "2023-range-rover-sport-p400-black", make: "Range Rover", model: "Sport P400", year: 2023, category: "executive", body: "Sport SUV", colour: "Santorini Black",
    engine: "3.0L I6 MHEV", power: "400 PS", drive: "AWD", fuel: "Petrol", transmission: "8-speed automatic",
    img: "range-rover-sport-p400-b.jpg", focus: "50% 60%",
    description: "Same P400 recipe in all-black. Gloss trim, dark glass and a cabin full of tech." },
  { slug: "2021-mercedes-benz-s500-4matic", make: "Mercedes-Benz", model: "S 500 4MATIC", year: 2021, category: "executive", body: "Executive saloon", colour: "Emerald Black",
    engine: "3.0L I6 EQ Boost", power: "429 hp", drive: "4MATIC", fuel: "Petrol", transmission: "9-speed automatic",
    img: "mercedes-s500.jpg", focus: "50% 60%", forHire: true,
    description: "The W223 S-Class, the benchmark executive car. Rear-seat comfort, ambient lighting and a ride that makes Nairobi traffic easier to bear." },
  { slug: "2022-porsche-cayenne-s-platinum-edition", make: "Porsche", model: "Cayenne S Platinum Edition", year: 2022, category: "exotic", body: "Performance SUV", colour: "Jet Black",
    engine: "2.9L twin-turbo V6", power: "440 hp", drive: "AWD", fuel: "Petrol", transmission: "8-speed Tiptronic S",
    img: "porsche-cayenne-s-platinum.jpg", focus: "50% 60%",
    description: "Platinum Edition detailing over the Cayenne S's twin-turbo V6. A family SUV that drives like a Porsche." },
  { slug: "2023-porsche-cayenne-platinum-edition", make: "Porsche", model: "Cayenne Platinum Edition", year: 2023, category: "exotic", body: "Luxury SUV", colour: "Black",
    engine: "3.0L turbo V6", power: "335 hp", drive: "AWD", fuel: "Petrol", transmission: "8-speed Tiptronic S",
    img: "porsche-cayenne-platinum.jpg", focus: "50% 55%",
    description: "Satin-platinum wheels and trim, a panoramic roof and Porsche's 3.0 V6. Understated and very quick." },
  { slug: "2022-mercedes-benz-gle-450-coupe", make: "Mercedes-Benz", model: "GLE 450 Coupé", year: 2022, category: "executive", body: "Coupé SUV", colour: "Polar White",
    engine: "3.0L I6 EQ Boost", power: "362 hp", drive: "4MATIC", fuel: "Petrol", transmission: "9-speed automatic",
    img: "mercedes-gle450-coupe.jpg", focus: "50% 55%",
    description: "Sloping roofline, diamond grille and smooth six-cylinder power. The stylish choice among big Mercedes SUVs." },
  { slug: "2023-ford-ranger-raptor", make: "Ford", model: "Ranger Raptor", year: 2023, category: "utility", body: "Performance pickup", colour: "Conquer Grey",
    engine: "Twin-turbo", drive: "4×4", transmission: "10-speed automatic",
    img: "ford-ranger-raptor.jpg", focus: "50% 55%",
    description: "Fox Live Valve dampers, long-travel suspension and a properly aggressive stance. Built for murram as much as tarmac." },
  { slug: "2015-toyota-land-cruiser-prado-tx", make: "Toyota", model: "Land Cruiser Prado TX", year: 2015, category: "utility", body: "4×4 SUV", colour: "Pearl White",
    drive: "4×4", img: "toyota-prado.jpg", focus: "50% 60%", forHire: true,
    description: "Kenya's favourite go-anywhere SUV. Seven seats and legendary Toyota reliability, ready for upcountry roads." },
  { slug: "2019-mercedes-benz-vito-220d", make: "Mercedes-Benz", model: "Vito 220d", year: 2019, category: "utility", body: "Executive van", colour: "Obsidian Black",
    engine: "2.1L turbo-diesel", drive: "RWD", fuel: "Diesel", transmission: "Automatic",
    img: "mercedes-vito.jpg", focus: "50% 60%", forHire: true,
    description: "Seating for the whole group, in Mercedes comfort. Good for corporate shuttles, bridal parties and airport runs with luggage." },
];

async function storeImage(file: string, hint: string) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const key = `${hint.replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${randomBytes(5).toString("hex")}.jpg`;
  const { data, info } = await sharp(path.join(IMG_DIR, file))
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  await fs.writeFile(path.join(UPLOAD_DIR, key), data);
  return { key, width: info.width, height: info.height };
}

async function main() {
  if (process.argv.includes("--reset")) {
    await db.enquiry.deleteMany();
    await db.photo.deleteMany();
    await db.car.deleteMany();
    await fs.rm(UPLOAD_DIR, { recursive: true, force: true });
    console.log("Reset cars, photos and enquiries.");
  }

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const exists = await db.user.findUnique({ where: { email } });
    if (!exists) {
      await db.user.create({ data: { email, name: "RNN Admin", passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`Created admin account ${email} (password is ADMIN_PASSWORD in .env)`);
    }
  } else console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set; no admin account created.");

  let added = 0;
  for (const [i, c] of CARS.entries()) {
    if (await db.car.findUnique({ where: { slug: c.slug } })) continue;
    const photo = await storeImage(c.img, c.slug);
    await db.car.create({
      data: {
        slug: c.slug, make: c.make, model: c.model, year: c.year ?? null, category: c.category, body: c.body, colour: c.colour,
        engine: c.engine ?? null, power: c.power ?? null, drive: c.drive ?? null, fuel: c.fuel ?? null,
        transmission: c.transmission ?? null, condition: c.condition ?? null, description: c.description,
        features: (c.features ?? []).join("\n"), featured: !!c.featured, forHire: !!c.forHire, status: "available",
        // Stagger creation dates so "newest" sorting has a stable order.
        createdAt: new Date(Date.now() - i * 3600_000),
        photos: { create: [{ ...photo, position: 0, focus: c.focus }] },
      },
    });
    added++;
  }
  console.log(`Seeded ${added} car(s). Total in stock: ${await db.car.count()}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
