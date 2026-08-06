/**
 * The Sundry catalogue.
 *
 * A curated general store: well-made objects for daily use. Every photograph
 * is a real Unsplash image chosen for a neutral ground and soft light, so the
 * grid reads as one shop rather than a pile of stock photography.
 *
 * `photo` holds the Unsplash photo slug only. URLs are assembled at seed time
 * by `imageUrl()` below, which keeps the transform parameters (width, quality,
 * crop) in exactly one place.
 *
 * Categories are constrained by the Product schema enum:
 * Electronics | Clothing | Books | Home | Sports | Other
 */

const UNSPLASH = "https://images.unsplash.com";

/** Build a sized, cropped, auto-formatted Unsplash URL for a photo slug. */
function imageUrl(photo, width = 1200) {
  return `${UNSPLASH}/${photo}?w=${width}&q=80&auto=format&fit=crop`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Products
//
// price   — a coherent ladder from $16 to $680. Nothing that would look absurd
//           beside its neighbours in the grid.
// stock   — realistic depth; a few deliberately low or zero to exercise the
//           "low stock" and "sold out" states in the UI.
// rating  — held between 3.9 and 5.0. Ratings are recomputed from real reviews
//           by review.controller, so these are only a starting position.
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── Electronics ───────────────────────────────────────────────────────────
  {
    name: "Meridian Solar Watch",
    brand: "Meridian",
    category: "Electronics",
    price: 215,
    stock: 24,
    rating: 4.6,
    reviews: 38,
    photo: "photo-1553545204-4f7d339aa06a",
    description:
      "A solar movement that never needs a battery. Six months of reserve from a single afternoon on a windowsill, a sapphire face that resists the scuffs a daily watch collects, and a silicone strap that survives being worn in the sea. Reads the time first and everything else second.",
  },
  {
    name: "Instant Film Camera",
    brand: "Northlight",
    category: "Electronics",
    price: 129,
    stock: 17,
    rating: 4.4,
    reviews: 52,
    photo: "photo-1526170375885-4d8ecf77b99f",
    description:
      "Point, press, wait ninety seconds. A fixed 106mm lens, a flash you can switch off, and a self-timer for the photographs nobody wants to be left out of. Takes standard wide film, so packs are easy to find. No screen, no menu, no second attempt.",
  },
  {
    name: "Reporter Camera Body",
    brand: "Northlight",
    category: "Electronics",
    price: 680,
    stock: 6,
    rating: 4.8,
    reviews: 21,
    photo: "photo-1502920917128-1aa500764cbd",
    description:
      "A 24-megapixel body built around the controls you actually reach for: a dial for exposure compensation, a proper shutter button, and a grip deep enough to hold one-handed. Weather-sealed at the seams. Sold as a body only — bring your own glass.",
  },
  {
    name: "Field Camera Kit",
    brand: "Northlight",
    category: "Electronics",
    price: 340,
    stock: 9,
    rating: 4.5,
    reviews: 14,
    photo: "photo-1526406915894-7bcd65f60845",
    description:
      "Everything that usually ends up scattered across a desk, in one roll: two spare batteries, a dual charger, three filters, a blower, a microfiber cloth and a cable tidy. The roll unfolds flat so you can see all of it at once instead of digging.",
  },
  {
    name: "Tracker Watch, Graphite",
    brand: "Meridian",
    category: "Electronics",
    price: 189,
    stock: 0,
    rating: 4.2,
    reviews: 67,
    photo: "photo-1546868871-7041f2a55e12",
    description:
      "Heart rate, sleep and distance, shown as three numbers rather than fourteen charts. Eighteen days between charges because the display is only on when you look at it. Pairs with a phone for maps and messages, and works perfectly well without one.",
  },

  // ── Home ──────────────────────────────────────────────────────────────────
  {
    name: "Stoneware Mug",
    brand: "Sundry",
    category: "Home",
    price: 18,
    stock: 84,
    rating: 4.7,
    reviews: 112,
    photo: "photo-1514228742587-6b1558fcca3d",
    description:
      "Thrown in a small studio and fired twice, so the glaze pools slightly where the wall meets the base. Holds 340ml — a proper mug, not a thimble. The unglazed foot ring means it will mark a bare wood table; use the coaster.",
  },
  {
    name: "Morning Mug & Saucer",
    brand: "Sundry",
    category: "Home",
    price: 34,
    stock: 41,
    rating: 4.5,
    reviews: 46,
    photo: "photo-1544787219-7f47ccb76574",
    description:
      "A narrower mug that keeps coffee hot longer, with a saucer wide enough for a biscuit and a spoon. Porcelain rather than stoneware, so the wall is thin and the rim is easy to drink from. Stacks four deep in a cupboard.",
  },
  {
    name: "Nesting Bowls, Set of Four",
    brand: "Sundry",
    category: "Home",
    price: 72,
    stock: 28,
    rating: 4.8,
    reviews: 63,
    photo: "photo-1610701596007-11502861dcfa",
    description:
      "Four bowls from 12cm to 24cm that stack into the footprint of the largest. Speckled stoneware, matte outside and glazed within. Oven-safe to 220°C, so the same bowl that holds the dough can bake the crumble.",
  },
  {
    name: "Shell Chair, Bone",
    brand: "Ashgrove",
    category: "Home",
    price: 245,
    stock: 12,
    rating: 4.4,
    reviews: 29,
    photo: "photo-1517705008128-361805f42e86",
    description:
      "A moulded seat on a steel rod base — light enough to move with one hand, rigid enough to lean back in. The shell is a single piece with no upholstery to stain, which makes it the sensible chair to put at a desk that also serves dinner.",
  },
  {
    name: "Buttoned Armchair, Chalk",
    brand: "Ashgrove",
    category: "Home",
    price: 520,
    stock: 4,
    rating: 4.6,
    reviews: 18,
    photo: "photo-1567538096630-e0c55bd6374c",
    description:
      "Deep-buttoned across the back and turned on carved front legs. The frame is kiln-dried beech, jointed rather than stapled, and the cover is a tight cotton weave that takes a brush. Built to be re-covered in fifteen years rather than replaced.",
  },
  {
    name: "Wall Clock, Oak",
    brand: "Ashgrove",
    category: "Home",
    price: 88,
    stock: 33,
    rating: 4.3,
    reviews: 37,
    photo: "photo-1533090161767-e6ffed986c88",
    description:
      "A 30cm oak face with brass hands and a silent sweep movement — no tick to notice at two in the morning. Runs a year on one AA. The numerals are printed, not applied, so there is nothing to catch dust.",
  },
  {
    name: "Brass Pendant, Set of Three",
    brand: "Ashgrove",
    category: "Home",
    price: 310,
    stock: 8,
    rating: 4.7,
    reviews: 22,
    photo: "photo-1540932239986-30128078f3c5",
    description:
      "Spun brass shades on braided cord, hung at three lengths so they read as a group over a table or an island. Unlacquered, so they will darken unevenly with handling — which is the point. Takes any E27 bulb; warm and dim suits them best.",
  },
  {
    name: "Hall Console, Ash",
    brand: "Ashgrove",
    category: "Home",
    price: 395,
    stock: 7,
    rating: 4.5,
    reviews: 16,
    photo: "photo-1530018607912-eff2daa1bac4",
    description:
      "Two drawers on wooden runners, 90cm wide and only 28cm deep, so it fits a hallway without narrowing it. Solid ash with a hardwax oil finish you can repair with a cloth instead of a cabinetmaker. Arrives with the legs off.",
  },
  {
    name: "Washed Linen Pillows, Pair",
    brand: "Sundry",
    category: "Home",
    price: 64,
    stock: 52,
    rating: 4.6,
    reviews: 74,
    photo: "photo-1616627561950-9f746e330187",
    description:
      "European flax, stonewashed twice so they arrive already soft rather than softening over a year. Hidden zip, generous 50×75cm. Linen sheds heat, which is why these are the pillows that stay comfortable in August.",
  },
  {
    name: "Reading Chair, Ochre",
    brand: "Ashgrove",
    category: "Home",
    price: 460,
    stock: 3,
    rating: 4.9,
    reviews: 11,
    photo: "photo-1586023492125-27b2c045efd7",
    description:
      "A tall back and a seat pitched slightly rearward — the geometry that lets you sit for two hours without shifting. Wool-blend cover in a dyed ochre that holds up to sunlight better than it looks like it should. Legs in solid oak.",
  },
  {
    name: "Loose Leaf Tea Flight",
    brand: "Sundry",
    category: "Home",
    price: 26,
    stock: 96,
    rating: 4.4,
    reviews: 88,
    photo: "photo-1563822249366-3efb23b8e0c9",
    description:
      "Six 20g tins: breakfast, earl grey, sencha, chamomile, peppermint and a smoked lapsang for the people who like that sort of thing. Whole leaf, not dust, so each will take three infusions before it gives up.",
  },

  // ── Clothing ──────────────────────────────────────────────────────────────
  {
    name: "Fisherman Knit, Oat",
    brand: "Halyard",
    category: "Clothing",
    price: 148,
    stock: 22,
    rating: 4.7,
    reviews: 54,
    photo: "photo-1434389677669-e08b4cac3105",
    description:
      "Cabled front and back in undyed lambswool, knitted heavy enough to stand up on its own. The natural oat colour comes from the fleece rather than a dye bath, so no two panels are quite the same shade. Sized to layer over a shirt.",
  },
  {
    name: "Flight Jacket, Rust",
    brand: "Halyard",
    category: "Clothing",
    price: 210,
    stock: 14,
    rating: 4.5,
    reviews: 31,
    photo: "photo-1591047139829-d91aecb6caea",
    description:
      "A short bomber in tight-woven cotton with a ribbed hem that actually grips. Two slash pockets, one zipped inside, and a lining that slides over knitwear instead of dragging on it. Wind-resistant; not waterproof, and does not pretend to be.",
  },
  {
    name: "Chambray Work Shirt",
    brand: "Halyard",
    category: "Clothing",
    price: 92,
    stock: 38,
    rating: 4.6,
    reviews: 69,
    photo: "photo-1596755094514-f87e34085b2c",
    description:
      "Indigo chambray that fades along the seams and cuffs where you'd expect. Single chest pocket, cat-eye buttons, a back yoke cut for reaching forward. Softens noticeably by the fourth wash and keeps going from there.",
  },
  {
    name: "Loopback Sweatshirt, Chalk",
    brand: "Halyard",
    category: "Clothing",
    price: 78,
    stock: 47,
    rating: 4.5,
    reviews: 83,
    photo: "photo-1620799140408-edc6dcb6d633",
    description:
      "380gsm loopback cotton, knitted on a vintage loop-wheel so the body has no side seams and hangs straight. Ribbed collar with a twill tape across the shoulders to stop it stretching out. Shrinks about 2% once and then stops.",
  },
  {
    name: "Selvedge Denim, Light Wash",
    brand: "Halyard",
    category: "Clothing",
    price: 135,
    stock: 26,
    rating: 4.4,
    reviews: 58,
    photo: "photo-1602293589930-45aad59ba3ab",
    description:
      "13.5oz selvedge from a shuttle loom, given a light wash so they're wearable on day one rather than raw. Straight through the thigh with a slight taper below the knee. Copper rivets, a hidden one at the back pockets to save your chairs.",
  },
  {
    name: "Heavy Cotton Tee, Black",
    brand: "Halyard",
    category: "Clothing",
    price: 38,
    stock: 120,
    rating: 4.3,
    reviews: 146,
    photo: "photo-1618354691373-d851c5c3a990",
    description:
      "240gsm cotton with a proper ribbed collar that survives the wash. Cut boxy rather than slim, hemmed to sit at the hip. Garment-dyed black, so it fades toward charcoal over a couple of years instead of going grey in a month.",
  },
  {
    name: "Derby Shoe, Teal",
    brand: "Cobbler & Sons",
    category: "Clothing",
    price: 195,
    stock: 11,
    rating: 4.6,
    reviews: 24,
    photo: "photo-1560343090-f0409e92791a",
    description:
      "Open-laced derbies in a teal suede that is far easier to wear than it sounds. Blake-stitched, so the sole is slim and the shoe bends where your foot does. Resoleable. Comes with a brush and a bag; you will need both.",
  },
  {
    name: "Leather Boot, Chestnut",
    brand: "Cobbler & Sons",
    category: "Clothing",
    price: 225,
    stock: 15,
    rating: 4.8,
    reviews: 41,
    photo: "photo-1479064555552-3ef4979f8908",
    description:
      "Six-eyelet boots in vegetable-tanned chestnut leather on a Goodyear welt, which means they can be resoled rather than binned. Stiff for the first week and then they are yours. Leather sole with a rubber heel block.",
  },
  {
    name: "Panama Hat",
    brand: "Halyard",
    category: "Clothing",
    price: 68,
    stock: 34,
    rating: 4.2,
    reviews: 27,
    photo: "photo-1533827432537-70133748f5c8",
    description:
      "Hand-woven toquilla straw with a grosgrain band. Light enough to forget you have it on and tight enough in the weave to be worth wearing at noon. Rolls loosely for a bag — not tightly, and not for long.",
  },
  {
    name: "Acetate Sunglasses",
    brand: "Meridian",
    category: "Clothing",
    price: 145,
    stock: 29,
    rating: 4.5,
    reviews: 62,
    photo: "photo-1572635196237-14b3f281503f",
    description:
      "A classic wayfarer profile cut from Italian acetate rather than injection-moulded plastic, which is why the arms can be adjusted by heat instead of snapping. Polarised grey lenses. Hinges are riveted and can be tightened.",
  },
  {
    name: "Dive Watch, Steel",
    brand: "Meridian",
    category: "Clothing",
    price: 385,
    stock: 5,
    rating: 4.9,
    reviews: 33,
    photo: "photo-1596516109370-29001ec8ec36",
    description:
      "Automatic movement, 200m rated, with a unidirectional bezel that only turns the safe way. Steel bracelet on solid links with a diver's extension. Heavy on the wrist in the way people who like this sort of watch consider a feature.",
  },
  {
    name: "Field Watch, Leather",
    brand: "Meridian",
    category: "Clothing",
    price: 290,
    stock: 13,
    rating: 4.7,
    reviews: 26,
    photo: "photo-1523170335258-f5ed11844a49",
    description:
      "A 38mm case, a matte dial and numerals you can read at a glance — the point of a field watch. Hand-wound, so it stops if you neglect it, which some people find reassuring. Leather strap on quick-release pins.",
  },
  {
    name: "Court Shoe, White",
    brand: "Cobbler & Sons",
    category: "Clothing",
    price: 95,
    stock: 44,
    rating: 4.1,
    reviews: 91,
    photo: "photo-1608667508764-33cf0726b13a",
    description:
      "A plain leather court shoe with a vulcanised rubber sole and almost no branding. Wipes clean, takes a polish, and goes with more than it has any right to. Runs about half a size large.",
  },

  // ── Books ─────────────────────────────────────────────────────────────────
  {
    name: "The Slow Kitchen",
    brand: "Quarto Press",
    category: "Books",
    price: 32,
    stock: 45,
    rating: 4.6,
    reviews: 48,
    photo: "photo-1544716278-ca5e3f4abd8c",
    description:
      "Ninety recipes organised by how long they take rather than by course, which turns out to be how people actually cook. Photographed in daylight in a real kitchen. Sewn binding, so it stays open on the counter without being held down.",
  },
  {
    name: "Marginalia: Essays",
    brand: "Quarto Press",
    category: "Books",
    price: 24,
    stock: 38,
    rating: 4.4,
    reviews: 22,
    photo: "photo-1589998059171-988d887df646",
    description:
      "Twenty-two short essays on reading, annotation and the things people write in the margins of borrowed books. Wide outer margins, deliberately — the book expects to be written in.",
  },
  {
    name: "Ruled Notebook, A5",
    brand: "Quarto Press",
    category: "Books",
    price: 16,
    stock: 140,
    rating: 4.5,
    reviews: 165,
    photo: "photo-1531346878377-a5be20888e57",
    description:
      "192 pages of 100gsm paper that fountain pen ink does not bleed through. Wire-bound so it folds fully flat, with a perforated last section for the pages you mean to give away. Ruled at 7mm.",
  },
  {
    name: "Collected Poems",
    brand: "Quarto Press",
    category: "Books",
    price: 19,
    stock: 61,
    rating: 4.3,
    reviews: 79,
    photo: "photo-1544947950-fa07a98d237f",
    description:
      "A pocket-sized collected edition with a matte cover that does not show fingerprints. Set in a generous size for its format — poetry set small is poetry unread. Ribbon marker.",
  },
  {
    name: "Field Notes on Making",
    brand: "Quarto Press",
    category: "Books",
    price: 28,
    stock: 30,
    rating: 4.7,
    reviews: 19,
    photo: "photo-1543002588-bfa74002ed7e",
    description:
      "Conversations with fourteen people who make things by hand for a living, printed alongside photographs of their benches rather than their faces. More useful about process than most books twice its length.",
  },

  // ── Sports ────────────────────────────────────────────────────────────────
  {
    name: "Home Training Set",
    brand: "Halyard",
    category: "Sports",
    price: 95,
    stock: 19,
    rating: 4.3,
    reviews: 44,
    photo: "photo-1584735935682-2f2b69dff9d2",
    description:
      "A pair of 5kg hex dumbbells, three resistance bands at graded tensions, and a door anchor. Enough to train properly in a room with no equipment in it. The hex heads stop them rolling under furniture.",
  },
  {
    name: "Trail Runner, Slate",
    brand: "Halyard",
    category: "Sports",
    price: 135,
    stock: 21,
    rating: 4.5,
    reviews: 57,
    photo: "photo-1491553895911-0055eca6402d",
    description:
      "A 6mm drop and a 4mm lug that grips wet rock without feeling like a hiking boot on tarmac. Rock plate underfoot for the stretches that deserve one. Breathable upper, which also means it drains fast.",
  },
  {
    name: "Court Trainer, White",
    brand: "Halyard",
    category: "Sports",
    price: 110,
    stock: 2,
    rating: 4.2,
    reviews: 36,
    photo: "photo-1608231387042-66d1773070a5",
    description:
      "A flat-soled trainer with a wide toe box and a stable heel — better for lifting than anything with a cushion in it. Leather upper with perforated panels. Holds its shape after a year in a way mesh trainers do not.",
  },
  {
    name: "Insulated Bottle, 750ml",
    brand: "Sundry",
    category: "Sports",
    price: 34,
    stock: 78,
    rating: 4.6,
    reviews: 103,
    photo: "photo-1602143407151-7111542de6e8",
    description:
      "Double-walled steel that holds cold for 24 hours and hot for 12, with a mouth wide enough to take ice cubes and a brush. Powder-coated so it does not sweat onto a desk. The lid seals properly — it can go in a bag on its side.",
  },

  // ── Other ─────────────────────────────────────────────────────────────────
  {
    name: "Leather Rucksack",
    brand: "Cobbler & Sons",
    category: "Other",
    price: 185,
    stock: 16,
    rating: 4.7,
    reviews: 39,
    photo: "photo-1547949003-9792a18a2601",
    description:
      "A flap-over rucksack in waxed canvas with leather at the base and straps, where bags actually wear out. Padded sleeve fits a 15in laptop. Buckles rather than clips, which is slower and lasts longer.",
  },
  {
    name: "Everyday Tote",
    brand: "Sundry",
    category: "Other",
    price: 22,
    stock: 110,
    rating: 4.4,
    reviews: 128,
    photo: "photo-1544816155-12df9643f363",
    description:
      "Heavy 16oz cotton canvas with bar-tacked handles set wide enough to clear a shoulder in a coat. Flat-bottomed, so it stands up when you put it down. Machine washable and improves for it.",
  },
  {
    name: "Restorative Hair Mask",
    brand: "Sundry",
    category: "Other",
    price: 46,
    stock: 55,
    rating: 4.5,
    reviews: 71,
    photo: "photo-1608248543803-ba4f8c70ae0b",
    description:
      "A weekly treatment of castor and jojoba oils with a low-lather surfactant. Ten minutes on damp hair. Unscented, because a mask you leave on your head for ten minutes is not the place for fragrance.",
  },
  {
    name: "Cleansing Gel",
    brand: "Sundry",
    category: "Other",
    price: 38,
    stock: 67,
    rating: 4.6,
    reviews: 94,
    photo: "photo-1620916566398-39f1143ab7be",
    description:
      "A clear gel that lifts sunscreen without stripping, at a pH close to skin's own. No fragrance, no essential oils, nothing that needs a warning on the back. 150ml lasts roughly three months at twice a day.",
  },
  {
    name: "Seed Oil Set",
    brand: "Sundry",
    category: "Other",
    price: 54,
    stock: 23,
    rating: 4.4,
    reviews: 33,
    photo: "photo-1611930022073-b7a4ba5fcccd",
    description:
      "Three cold-pressed oils — hemp, rosehip and jojoba — in amber glass with pipettes, because these oxidise in clear bottles. Single-ingredient each, so you can work out what your skin actually objects to.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Editorial imagery
//
// Photographs used for merchandising on the home page. They are not products
// and are never inserted into the database — the client imports these through
// the storefront rather than fetching them.
// ─────────────────────────────────────────────────────────────────────────────
const EDITORIAL = {
  hero: "photo-1556905055-8f358a7a47b2",
  layering: "photo-1479064555552-3ef4979f8908",
  workshop: "photo-1596755094514-f87e34085b2c",
  table: "photo-1610701596007-11502861dcfa",
};

module.exports = { PRODUCTS, EDITORIAL, imageUrl };
