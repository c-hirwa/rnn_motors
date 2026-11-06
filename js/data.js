/* RNN Motors — vehicle data.
   Photos are RNN's own stock photos. Specs are indicative manufacturer figures;
   confirm exact build, mileage and price with the sales team before publishing. */

window.RNN = {
  phone: ["+254 794 861101", "+254 723 766 766"],
  whatsapp: "254794861101",
  address: "The Retro Hub, Ndoto Road, off James Gichuru Road, Lavington, Nairobi",

  cars: [
    {
      id: "aston-martin-dbx",
      make: "Aston Martin", model: "DBX", year: 2022,
      cat: "exotic", body: "Performance SUV", colour: "Silver",
      engine: "4.0L twin-turbo V8", power: "542 hp", drive: "AWD", fuel: "Petrol",
      img: "aston-martin-dbx.jpg", pos: "50% 62%",
      blurb: "Aston Martin's first SUV, still every bit a grand tourer. Hand-finished cabin, a V8 with real presence, and a shape that turns heads on James Gichuru Road.",
      signature: true
    },
    {
      id: "bentley-flying-spur",
      make: "Bentley", model: "Flying Spur", year: null,
      cat: "exotic", body: "Luxury saloon", colour: "Glacier White",
      engine: "Twin-turbo", power: "On request", drive: "AWD", fuel: "Petrol",
      img: "bentley-flying-spur.jpg", pos: "60% 55%",
      blurb: "Our signature white Flying Spur, the car Nairobi books for weddings. Quilted hide, deep-pile carpets and a ride as calm as a lounge.",
      signature: true, hire: true
    },
    {
      id: "mercedes-g63",
      make: "Mercedes-AMG", model: "G 63", year: null,
      cat: "executive", body: "Performance SUV", colour: "Grey",
      engine: "4.0L biturbo V8", power: "577 hp", drive: "4MATIC", fuel: "Petrol",
      img: "mercedes-g63.jpg", pos: "50% 55%",
      blurb: "The boxy icon with side-exit exhausts and three locking differentials. As comfortable at a Karen gala as on a Laikipia track.",
      signature: true, hire: true
    },
    {
      id: "range-rover-autobiography",
      make: "Range Rover", model: "Vogue Autobiography", year: 2022,
      cat: "executive", body: "Luxury SUV", colour: "Eiger Grey",
      engine: "Mild-hybrid", power: "On request", drive: "AWD", fuel: "Petrol",
      img: "range-rover-autobiography.jpg", pos: "50% 45%",
      blurb: "The new-generation Range Rover in its top trim. Minimal lines and a quiet cabin, with real off-road ability underneath.",
      signature: true
    },
    {
      id: "range-rover-vogue",
      make: "Range Rover", model: "Vogue", year: 2022,
      cat: "executive", body: "Luxury SUV", colour: "Black",
      engine: "Mild-hybrid", power: "On request", drive: "AWD", fuel: "Petrol",
      img: "range-rover-vogue.jpg", pos: "50% 65%",
      blurb: "Blacked-out L460 Vogue. Presidential presence with the modern Range Rover's tech and air-suspension ride.",
      hire: true
    },
    {
      id: "range-rover-sport-p400",
      make: "Range Rover", model: "Sport P400", year: 2023,
      cat: "executive", body: "Sport SUV", colour: "Fuji White",
      engine: "3.0L I6 MHEV", power: "400 PS", drive: "AWD", fuel: "Petrol",
      img: "range-rover-sport-p400.jpg", pos: "50% 60%",
      blurb: "The latest Range Rover Sport: sharper, lower and quicker. Six-cylinder mild hybrid with dynamic air suspension."
    },
    {
      id: "range-rover-sport-p400-b",
      make: "Range Rover", model: "Sport P400", year: 2023,
      cat: "executive", body: "Sport SUV", colour: "Santorini Black",
      engine: "3.0L I6 MHEV", power: "400 PS", drive: "AWD", fuel: "Petrol",
      img: "range-rover-sport-p400-b.jpg", pos: "50% 60%",
      blurb: "Same P400 recipe in all-black. Gloss trim, dark glass and a cabin full of tech."
    },
    {
      id: "mercedes-s500",
      make: "Mercedes-Benz", model: "S 500 4MATIC", year: 2021,
      cat: "executive", body: "Executive saloon", colour: "Emerald Black",
      engine: "3.0L I6 EQ Boost", power: "429 hp", drive: "4MATIC", fuel: "Petrol",
      img: "mercedes-s500.jpg", pos: "50% 60%",
      blurb: "The W223 S-Class, the benchmark executive car. Rear-seat comfort, ambient lighting and a ride that makes Nairobi traffic easier to bear.",
      hire: true
    },
    {
      id: "porsche-cayenne-s-platinum",
      make: "Porsche", model: "Cayenne S Platinum Edition", year: 2022,
      cat: "exotic", body: "Performance SUV", colour: "Jet Black",
      engine: "2.9L twin-turbo V6", power: "440 hp", drive: "AWD", fuel: "Petrol",
      img: "porsche-cayenne-s-platinum.jpg", pos: "50% 60%",
      blurb: "Platinum Edition detailing over the Cayenne S's twin-turbo V6. A family SUV that drives like a Porsche."
    },
    {
      id: "porsche-cayenne-platinum",
      make: "Porsche", model: "Cayenne Platinum Edition", year: 2023,
      cat: "exotic", body: "Luxury SUV", colour: "Black",
      engine: "3.0L turbo V6", power: "335 hp", drive: "AWD", fuel: "Petrol",
      img: "porsche-cayenne-platinum.jpg", pos: "50% 55%",
      blurb: "Satin-platinum wheels and trim, a panoramic roof and Porsche's 3.0 V6. Understated and very quick."
    },
    {
      id: "mercedes-gle450-coupe",
      make: "Mercedes-Benz", model: "GLE 450 Coupé", year: 2022,
      cat: "executive", body: "Coupé SUV", colour: "Polar White",
      engine: "3.0L I6 EQ Boost", power: "362 hp", drive: "4MATIC", fuel: "Petrol",
      img: "mercedes-gle450-coupe.jpg", pos: "50% 55%",
      blurb: "Sloping roofline, diamond grille and smooth six-cylinder power. The stylish choice among big Mercedes SUVs."
    },
    {
      id: "ford-ranger-raptor",
      make: "Ford", model: "Ranger Raptor", year: 2023,
      cat: "utility", body: "Performance pickup", colour: "Conquer Grey",
      engine: "Twin-turbo", power: "On request", drive: "4×4", fuel: "On request",
      img: "ford-ranger-raptor.jpg", pos: "50% 55%",
      blurb: "Fox Live Valve dampers, long-travel suspension and a properly aggressive stance. Built for murram as much as tarmac."
    },
    {
      id: "toyota-prado",
      make: "Toyota", model: "Land Cruiser Prado TX", year: 2015,
      cat: "utility", body: "4×4 SUV", colour: "Pearl White",
      engine: "On request", power: "On request", drive: "4×4", fuel: "On request",
      img: "toyota-prado.jpg", pos: "50% 60%",
      blurb: "Kenya's favourite go-anywhere SUV. Seven seats and legendary Toyota reliability, ready for upcountry roads.",
      hire: true
    },
    {
      id: "mercedes-vito",
      make: "Mercedes-Benz", model: "Vito 220d", year: 2019,
      cat: "utility", body: "Executive van", colour: "Obsidian Black",
      engine: "2.1L turbo-diesel", power: "On request", drive: "RWD", fuel: "Diesel",
      img: "mercedes-vito.jpg", pos: "50% 60%",
      blurb: "Seating for the whole group, in Mercedes comfort. Good for corporate shuttles, bridal parties and airport runs with luggage.",
      hire: true
    }
  ],

  /* What clients commonly ask RNN to source (from RNN's catalogue and socials). */
  sourcing: [
    "Mercedes-Maybach GLS 600", "Bentley Bentayga", "Porsche Taycan", "Mercedes-AMG G 63",
    "Audi A8 S-line", "Range Rover Autobiography", "Aston Martin DBX", "Toyota Land Cruiser 300"
  ]
};
