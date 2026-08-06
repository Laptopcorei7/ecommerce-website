/**
 * Review seed material.
 *
 * Bodies are written per category and per rating band rather than per product,
 * so they stay specific enough to read as real without needing 200 hand-written
 * entries. The seeder pairs these with the demo customers below and recomputes
 * each product's averageRating from what it actually inserted — the ratings the
 * storefront shows are always derived from real Review documents.
 */

// A dozen customers is the ceiling on reviews per product: the Review model has
// a unique (productId, userId) index, so one person cannot review twice.
const CUSTOMERS = [
  { name: "Adwoa Mensah", email: "adwoa.mensah@example.com" },
  { name: "Tom Rutherford", email: "tom.rutherford@example.com" },
  { name: "Priya Nair", email: "priya.nair@example.com" },
  { name: "Sam Okonkwo", email: "sam.okonkwo@example.com" },
  { name: "Lena Fischer", email: "lena.fischer@example.com" },
  { name: "Marcus Bell", email: "marcus.bell@example.com" },
  { name: "Yuki Tanaka", email: "yuki.tanaka@example.com" },
  { name: "Claire Dubois", email: "claire.dubois@example.com" },
  { name: "Danny Whelan", email: "danny.whelan@example.com" },
  { name: "Ife Adeyemi", email: "ife.adeyemi@example.com" },
  { name: "Rosa Iglesias", email: "rosa.iglesias@example.com" },
  { name: "Nathan Brooks", email: "nathan.brooks@example.com" },
];

// Every demo customer shares this password so the account picker in the README
// is a single line. Hashed by the Register pre-save hook, never stored plain.
const CUSTOMER_PASSWORD = "Sundry!Demo7";

/**
 * Review bodies keyed by category, then by band:
 *   high = 5,  good = 4,  mixed = 3
 * Each entry is [title, comment].
 */
const BODIES = {
  Electronics: {
    high: [
      [
        "Does the one thing well",
        "Set it up in about four minutes and haven't touched a setting since. That's the whole review.",
      ],
      [
        "Better than the spec sheet suggests",
        "Bought it expecting to be mildly disappointed and wasn't. Build quality is where the money went.",
      ],
      [
        "Third year, still fine",
        "Owned this a while now. Nothing has rattled loose and the finish hasn't worn through anywhere.",
      ],
    ],
    good: [
      [
        "Solid, with one gripe",
        "No complaints about how it works. The manual is close to useless, so budget ten minutes on a forum.",
      ],
      [
        "Happy with it",
        "Does what the listing says. Charging cable is short enough to be annoying if your socket is behind furniture.",
      ],
      [
        "Good buy at this price",
        "Would have paid more. Knocking a star off because the case picks up fingerprints instantly.",
      ],
    ],
    mixed: [
      [
        "Fine, not remarkable",
        "Works. Feels a bit light in the hand compared to what I replaced, which may just be me.",
      ],
      [
        "Depends what you need",
        "If you want the simple version, this is it. If you wanted the features, you'll be annoyed.",
      ],
    ],
  },
  Home: {
    high: [
      [
        "Exactly the weight I wanted",
        "Heavy enough to feel considered, not so heavy it's a chore. Glaze is lovely up close.",
      ],
      [
        "Bought a second one",
        "Used it every day for two months then ordered another. That's the strongest thing I can say.",
      ],
      [
        "Looks better in person",
        "The photos undersell the colour. Warmer and less grey than it appears on screen.",
      ],
    ],
    good: [
      [
        "Very good, mind the finish",
        "Really pleased. It does mark if you put anything wet on it directly, as the description warns.",
      ],
      [
        "Does the job nicely",
        "Well made and the right size for the space. Assembly took longer than the twenty minutes claimed.",
      ],
      [
        "Would recommend",
        "Sturdy and simple. One of mine arrived with a small chip; replaced without any argument.",
      ],
    ],
    mixed: [
      [
        "Smaller than expected",
        "My fault for not reading the dimensions properly. Quality is fine, it just isn't the size I pictured.",
      ],
      [
        "Nice but pricey",
        "No complaints about how it's made. Whether it's worth this much is a separate question.",
      ],
    ],
  },
  Clothing: {
    high: [
      [
        "Sizing notes are accurate",
        "Followed the advice in the description and it fits exactly as promised. Rare.",
      ],
      [
        "Wearing it constantly",
        "Has become the default. Washed it six times and it looks the same as it did new.",
      ],
      [
        "Worth the money",
        "Costs more than the high street equivalent and is very obviously better made. Seams are clean inside as well as out.",
      ],
    ],
    good: [
      [
        "Great, runs slightly large",
        "Lovely fabric. I'd take a size down if you're between two.",
      ],
      [
        "Really pleased",
        "Colour is true to the photos. Slight stiffness at first that softened after a wash, as expected.",
      ],
      [
        "Good quality",
        "Well cut and the details are right. Would prefer a slightly longer body but that's personal.",
      ],
    ],
    mixed: [
      [
        "Fit is odd on me",
        "Nothing wrong with the make. The cut just doesn't suit my shape — returns were straightforward.",
      ],
      [
        "Decent, not exceptional",
        "Perfectly good. I expected a bit more heft from the description.",
      ],
    ],
  },
  Books: {
    high: [
      [
        "Beautifully produced",
        "Paper stock and binding are a cut above. Stays open on a table, which sounds trivial until you own one that doesn't.",
      ],
      [
        "Bought three as gifts",
        "Everyone I've given it to has mentioned it since. Says enough.",
      ],
      [
        "Better than I expected",
        "Picked it up on a whim and read it in two sittings.",
      ],
    ],
    good: [
      [
        "Good, uneven in places",
        "The strong sections are excellent. A couple of chapters felt like padding.",
      ],
      [
        "Nicely made",
        "Lovely object. Content is solid rather than surprising, but I've gone back to it twice.",
      ],
      [
        "Recommended",
        "Well edited and well set. Slightly small type for reading in bed.",
      ],
    ],
    mixed: [
      [
        "Not quite what I wanted",
        "Well produced, but aimed at a more general reader than I'd assumed.",
      ],
      ["Fine", "Readable and attractive. I doubt I'll return to it."],
    ],
  },
  Sports: {
    high: [
      [
        "Holding up well",
        "Six months of regular use and no sign of wear where I expected it first.",
      ],
      [
        "Does what it should",
        "Straightforward, well made, no gimmicks. Replaced a more expensive set that fell apart.",
      ],
      [
        "Grip is excellent",
        "Tested it in the wet on purpose. No slipping at all.",
      ],
    ],
    good: [
      [
        "Good kit",
        "Works well. Wish it came with a bag — everything ends up loose in a cupboard.",
      ],
      [
        "Pleased overall",
        "Solid build. Took a couple of sessions to get used to compared to my old ones.",
      ],
      [
        "Does the job",
        "No complaints. The finish scuffs more easily than I'd like.",
      ],
    ],
    mixed: [
      [
        "Alright",
        "Perfectly usable. Not obviously better than the cheaper version I had before.",
      ],
      [
        "Sizing is inconsistent",
        "One fits, one is tight. Might just be a bad pair.",
      ],
    ],
  },
  Other: {
    high: [
      [
        "Now a staple",
        "Reordered before the first one ran out, which is the only endorsement that counts.",
      ],
      [
        "No fragrance, thank you",
        "Genuinely unscented, unlike most things that claim to be. My skin has stopped complaining.",
      ],
      [
        "Very well made",
        "Everyday item, made properly. Has taken a lot of use without looking tired.",
      ],
    ],
    good: [
      [
        "Works well",
        "Does what it says. The packaging is more elaborate than it needs to be.",
      ],
      [
        "Happy with it",
        "Good quality. A pump would be better than a screw cap for something used daily.",
      ],
      [
        "Would buy again",
        "Lasted longer than expected. Slightly awkward to travel with.",
      ],
    ],
    mixed: [
      [
        "Not for me",
        "Nothing wrong with it — it just didn't do much noticeable over six weeks.",
      ],
      [
        "Fine, expensive",
        "Perfectly good product. There are cheaper versions that perform similarly.",
      ],
    ],
  },
};

module.exports = { CUSTOMERS, CUSTOMER_PASSWORD, BODIES };
